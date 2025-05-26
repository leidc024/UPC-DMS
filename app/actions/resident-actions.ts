"use server"

import { sql, type Resident } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getResidents() {
  const residents = await sql<Resident[]>`
    SELECT * FROM residents ORDER BY lname, fname
  `
  return residents
}

export async function getResident(id: string) {
  const residents = await sql<Resident[]>`
    SELECT * FROM residents WHERE student_number = ${id}
  `
  return residents[0] || null
}

export async function addResident(resident: Omit<Resident, "student_number"> & { student_number: string }) {
  await sql`
    INSERT INTO residents (student_number, fname, lname, course, year_level, email, emergency_contact)
    VALUES (
      ${resident.student_number}, 
      ${resident.fname}, 
      ${resident.lname}, 
      ${resident.course}, 
      ${resident.year_level}, 
      ${resident.email}, 
      ${resident.emergency_contact}
    )
  `
  revalidatePath("/residents")
  revalidatePath("/overview") // Add overview path revalidation
  revalidatePath("/")
}

export async function updateResident(id: string, resident: Partial<Resident>) {
  await sql`
    UPDATE residents
    SET 
      fname = ${resident.fname},
      lname = ${resident.lname},
      course = ${resident.course},
      year_level = ${resident.year_level},
      email = ${resident.email},
      emergency_contact = ${resident.emergency_contact}
    WHERE student_number = ${id}
  `
  revalidatePath("/residents")
  revalidatePath(`/residents/${id}`)
  revalidatePath("/overview") // Add overview path revalidation
  revalidatePath("/")
}

export async function deleteResident(id: string) {
  // First, delete all occupants associated with this resident
  await sql`
    DELETE FROM occupants WHERE student_number = ${id}
  `

  // Then delete the resident
  await sql`
    DELETE FROM residents WHERE student_number = ${id}
  `

  revalidatePath("/residents")
  revalidatePath("/rooms")
  revalidatePath("/occupants")
  revalidatePath("/overview") // Add overview path revalidation
  revalidatePath("/")
}
