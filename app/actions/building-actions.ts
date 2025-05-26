"use server"

import { sql, type Building } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getBuildings() {
  const buildings = await sql<Building[]>`
    SELECT * FROM buildings ORDER BY name
  `
  return buildings
}

export async function getBuilding(id: number) {
  const buildings = await sql<Building[]>`
    SELECT * FROM buildings WHERE building_id = ${id}
  `
  return buildings[0] || null
}

// Fix the addBuilding function to ensure it works correctly
export async function addBuilding(building: Omit<Building, "building_id">) {
  const result = await sql`
    INSERT INTO buildings (name, location, capacity, description)
    VALUES (${building.name}, ${building.location}, ${building.capacity}, ${building.description})
    RETURNING building_id
  `

  revalidatePath("/buildings")
  revalidatePath("/overview") // Add overview path revalidation
  revalidatePath("/")

  return result[0]?.building_id
}

export async function updateBuilding(id: number, building: Partial<Building>) {
  await sql`
    UPDATE buildings
    SET 
      name = ${building.name},
      location = ${building.location},
      capacity = ${building.capacity},
      description = ${building.description}
    WHERE building_id = ${id}
  `
  revalidatePath("/buildings")
  revalidatePath(`/buildings/${id}`)
  revalidatePath("/overview") // Add overview path revalidation
  revalidatePath("/")
}

export async function deleteBuilding(id: number) {
  // First, delete all occupants associated with rooms in this building
  await sql`
    DELETE FROM occupants 
    WHERE building_id = ${id}
  `

  // Then delete all rooms in this building
  await sql`
    DELETE FROM rooms 
    WHERE building_id = ${id}
  `

  // Finally delete the building
  await sql`
    DELETE FROM buildings 
    WHERE building_id = ${id}
  `

  revalidatePath("/buildings")
  revalidatePath("/rooms")
  revalidatePath("/occupants")
  revalidatePath("/overview") // Add overview path revalidation
  revalidatePath("/")
}
