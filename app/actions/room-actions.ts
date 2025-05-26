"use server"

import { sql, type Room } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getRooms() {
  const rooms = await sql<Room[]>`
    SELECT * FROM rooms ORDER BY building_id, room_number
  `
  return rooms
}

export async function getRoom(buildingId: number, roomNumber: number) {
  const rooms = await sql<Room[]>`
    SELECT * FROM rooms 
    WHERE building_id = ${buildingId} AND room_number = ${roomNumber}
  `
  return rooms[0] || null
}

export async function addRoom(room: Room) {
  await sql`
    INSERT INTO rooms (building_id, room_number, floor, capacity, monthly_rate, is_occupied)
    VALUES (
      ${room.building_id}, 
      ${room.room_number}, 
      ${room.floor}, 
      ${room.capacity}, 
      ${room.monthly_rate}, 
      ${room.is_occupied}
    )
  `
  revalidatePath("/rooms")
  revalidatePath(`/buildings/${room.building_id}`)
  revalidatePath("/overview")
  revalidatePath("/")
}

export async function updateRoom(buildingId: number, roomNumber: number, room: Partial<Room>) {
  await sql`
    UPDATE rooms
    SET 
      floor = ${room.floor},
      capacity = ${room.capacity},
      monthly_rate = ${room.monthly_rate},
      is_occupied = ${room.is_occupied}
    WHERE building_id = ${buildingId} AND room_number = ${roomNumber}
  `
  revalidatePath("/rooms")
  revalidatePath(`/buildings/${buildingId}`)
  revalidatePath(`/rooms/${buildingId}/${roomNumber}`)
  revalidatePath("/overview")
  revalidatePath("/")
}

export async function deleteRoom(buildingId: number, roomNumber: number) {
  // First, delete all occupants associated with this room
  await sql`
    DELETE FROM occupants 
    WHERE building_id = ${buildingId} AND room_number = ${roomNumber}
  `

  // Then delete the room
  await sql`
    DELETE FROM rooms 
    WHERE building_id = ${buildingId} AND room_number = ${roomNumber}
  `

  revalidatePath("/rooms")
  revalidatePath(`/buildings/${buildingId}`)
  revalidatePath("/occupants")
  revalidatePath("/overview")
  revalidatePath("/")
}
