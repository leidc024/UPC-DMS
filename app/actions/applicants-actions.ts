"use server"

import { sql, type Applicant } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getApplicants() {
  const applicants = await sql<Applicant[]>`
    SELECT * FROM applicants ORDER BY lname, fname
  `
  return applicants
}

export async function getApplicant(id: string) {
  const applicants = await sql<Applicant[]>`
    SELECT * FROM applicants WHERE student_number = ${id}
  `
  return applicants[0] || null
}

export async function addApplicants(applicant: Omit<Applicant, "student_number"> & { student_number: string }) {
  await sql`
        INSERT INTO applicants (student_number, fname, lname, within_cebu, psalary, year_level, chance_of_passing, emergency_contact)
        VALUES (
            ${applicant.student_number}, 
            ${applicant.fname}, 
            ${applicant.lname}, 
            ${applicant.within_cebu}, 
            ${applicant.psalary === "" ? null : Number(applicant.psalary)},
            ${applicant.year_level === "" ? null : Number(applicant.year_level)}, 
            ${applicant.chance_of_passing === "" ? null : Number(applicant.chance_of_passing)}, 
            ${applicant.emergency_contact}
        )
    `
  revalidatePath("/applicants")
  revalidatePath("/")
}

export async function updateApplicant(id: string, applicant: Partial<Applicant>) {
  await sql`
    UPDATE applicants
    SET 
      fname = ${applicant.fname},
      lname = ${applicant.lname},
      within_cebu = ${applicant.within_cebu},
      psalary = ${applicant.psalary},
      year_level = ${applicant.year_level},
      chance_of_passing = ${applicant.chance_of_passing},
      emergency_contact = ${applicant.emergency_contact}
    WHERE student_number = ${id}
  `
  revalidatePath("/applicants")
  revalidatePath(`/applicants/${id}`)
  revalidatePath("/")
}

export async function deleteApplicant(id: string) {
  await sql`
    DELETE FROM applicants WHERE student_number = ${id}
  `
  revalidatePath("/applicants")
  revalidatePath("/")
}

// ----------------- NEW FUNCTION: Convert Applicant to Resident -----------------
export async function convertApplicantToResident(
  applicantId: string,
  email: string,
  course: string
) {
  // 1. Get applicant info
  const applicants = await sql<Applicant[]>`
    SELECT * FROM applicants WHERE student_number = ${applicantId}
  `
  const applicant = applicants[0]
  if (!applicant) throw new Error("Applicant not found")

  // 2. Insert into residents table, inheriting values + the new ones
  await sql`
    INSERT INTO residents (
      student_number,
      fname,
      lname,
      year_level,
      emergency_contact,
      email,
      course
    )
    VALUES (
      ${applicant.student_number},
      ${applicant.fname},
      ${applicant.lname},
      ${applicant.year_level},
      ${applicant.emergency_contact},
      ${email},
      ${course}
    )
  `

  // 3. Delete from applicants
  await sql`
    DELETE FROM applicants WHERE student_number = ${applicantId}
  `

  // 4. Revalidate relevant pages
  revalidatePath("/applicants")
  revalidatePath("/residents")
  revalidatePath("/")
}
