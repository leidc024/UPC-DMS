"use server"

import { sql, type Occupant, type Room } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getOccupants() {
  const occupants = await sql<Occupant[]>`
    SELECT * FROM occupants ORDER BY check_in DESC
  `
  return occupants
}

export async function getOccupantsByRoom(buildingId: number, roomNumber: number) {
  const occupants = await sql<(Occupant & { resident_name: string })[]>`
    SELECT o.*, CONCAT(r.fname, ' ', r.lname) as resident_name
    FROM occupants o
    JOIN residents r ON o.student_number = r.student_number
    WHERE o.building_id = ${buildingId} AND o.room_number = ${roomNumber}
    ORDER BY o.check_in DESC
  `
  return occupants
}

// Update the getOccupantsByResident function to use string for studentNumber
export async function getOccupantsByResident(studentNumber: string) {
  const occupants = await sql<(Occupant & { building_name: string })[]>`
    SELECT o.*, b.name as building_name
    FROM occupants o
    JOIN buildings b ON o.building_id = b.building_id
    WHERE o.student_number = ${studentNumber}
    ORDER BY o.check_in DESC
  `
  return occupants
}

// Update the addOccupant function to handle string student_number and check for active occupancy
export async function addOccupant(occupant: Omit<Occupant, "occupant_id">) {
  try {
    // First, check if the student already has an active occupancy
    const existingActiveOccupancy = await sql<(Occupant & { building_name: string })[]>`
      SELECT o.*, b.name as building_name
      FROM occupants o
      JOIN buildings b ON o.building_id = b.building_id
      WHERE o.student_number = ${occupant.student_number} 
      AND o.check_out IS NULL
    `

    if (existingActiveOccupancy.length > 0) {
      const activeOccupancy = existingActiveOccupancy[0]
      throw new Error(
        `This resident is already actively occupying Room ${activeOccupancy.room_number} in ${activeOccupancy.building_name}. Please check them out first before assigning to a new room.`,
      )
    }

    // Get the room's capacity
    const roomData = await sql<Room[]>`
      SELECT * FROM rooms 
      WHERE building_id = ${occupant.building_id} AND room_number = ${occupant.room_number}
    `

    if (roomData.length === 0) {
      throw new Error("Room not found")
    }

    const roomCapacity = roomData[0].capacity

    // Count current active occupants
    const currentOccupants = await sql<{ count: number }[]>`
      SELECT COUNT(*) as count
      FROM occupants
      WHERE building_id = ${occupant.building_id} 
      AND room_number = ${occupant.room_number}
      AND check_out IS NULL
    `

    const occupantCount = Number.parseInt(currentOccupants[0].count)

    // Check if adding another occupant would exceed capacity
    if (occupantCount >= roomCapacity) {
      throw new Error(`Room is at full capacity (${roomCapacity} occupants)`)
    }

    // Only mark as occupied if this will fill the room to capacity
    if (occupantCount + 1 >= roomCapacity) {
      await sql`
        UPDATE rooms
        SET is_occupied = true
        WHERE building_id = ${occupant.building_id} AND room_number = ${occupant.room_number}
      `
    }

    await sql`
      INSERT INTO occupants (student_number, building_id, room_number, check_in, check_out)
      VALUES (
        ${occupant.student_number}, 
        ${occupant.building_id}, 
        ${occupant.room_number}, 
        ${occupant.check_in}, 
        ${occupant.check_out}
      )
    `

    revalidatePath("/rooms")
    revalidatePath(`/buildings/${occupant.building_id}`)
    revalidatePath(`/rooms/${occupant.building_id}/${occupant.room_number}`)
    revalidatePath(`/residents/${occupant.student_number}`)
    revalidatePath("/overview")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Error in addOccupant:", error)
    // Re-throw the error so it can be caught by the client
    throw error
  }
}

export async function updateOccupant(id: number, occupant: Partial<Occupant>) {
  await sql`
    UPDATE occupants
    SET 
      check_in = ${occupant.check_in},
      check_out = ${occupant.check_out}
    WHERE occupant_id = ${id}
  `

  // If check_out is set, update room status based on remaining occupants
  if (occupant.check_out) {
    const currentOccupant = await sql<Occupant[]>`
      SELECT * FROM occupants WHERE occupant_id = ${id}
    `

    if (currentOccupant.length > 0) {
      const { building_id, room_number } = currentOccupant[0]

      // Get room capacity
      const roomData = await sql<Room[]>`
        SELECT * FROM rooms 
        WHERE building_id = ${building_id} AND room_number = ${room_number}
      `

      if (roomData.length > 0) {
        const roomCapacity = roomData[0].capacity

        // Count remaining active occupants
        const activeOccupants = await sql<{ count: number }[]>`
          SELECT COUNT(*) as count
          FROM occupants
          WHERE building_id = ${building_id} 
          AND room_number = ${room_number}
          AND check_out IS NULL
          AND occupant_id != ${id}
        `

        const remainingCount = Number.parseInt(activeOccupants[0].count)

        // Only mark as unoccupied if no occupants remain
        // Only mark as occupied if at full capacity
        if (remainingCount === 0) {
          await sql`
            UPDATE rooms
            SET is_occupied = false
            WHERE building_id = ${building_id} AND room_number = ${room_number}
          `
        } else if (remainingCount < roomCapacity) {
          await sql`
            UPDATE rooms
            SET is_occupied = false
            WHERE building_id = ${building_id} AND room_number = ${room_number}
          `
        }
      }

      revalidatePath(`/buildings/${building_id}`)
      revalidatePath(`/rooms/${building_id}/${room_number}`)
    }
  }

  revalidatePath("/rooms")
  revalidatePath("/overview")
  revalidatePath("/")
}

export async function deleteOccupant(id: number) {
  // Get occupant details before deletion
  const occupants = await sql<Occupant[]>`
    SELECT * FROM occupants WHERE occupant_id = ${id}
  `

  if (occupants.length > 0) {
    const { building_id, room_number } = occupants[0]

    await sql`
      DELETE FROM occupants WHERE occupant_id = ${id}
    `

    // Get room capacity
    const roomData = await sql<Room[]>`
      SELECT * FROM rooms 
      WHERE building_id = ${building_id} AND room_number = ${room_number}
    `

    if (roomData.length > 0) {
      const roomCapacity = roomData[0].capacity

      // Count remaining active occupants
      const activeOccupants = await sql<{ count: number }[]>`
        SELECT COUNT(*) as count
        FROM occupants
        WHERE building_id = ${building_id} 
        AND room_number = ${room_number}
        AND check_out IS NULL
      `

      const remainingCount = Number.parseInt(activeOccupants[0].count)

      // Only mark as unoccupied if no occupants remain
      // Only mark as occupied if at full capacity
      if (remainingCount === 0) {
        await sql`
          UPDATE rooms
          SET is_occupied = false
          WHERE building_id = ${building_id} AND room_number = ${room_number}
        `
      } else if (remainingCount < roomCapacity) {
        await sql`
          UPDATE rooms
          SET is_occupied = false
          WHERE building_id = ${building_id} AND room_number = ${room_number}
        `
      }
    }

    revalidatePath(`/buildings/${building_id}`)
    revalidatePath(`/rooms/${building_id}/${room_number}`)
    revalidatePath(`/residents/${occupants[0].student_number}`)
  }

  revalidatePath("/rooms")
  revalidatePath("/overview")
  revalidatePath("/")
}
