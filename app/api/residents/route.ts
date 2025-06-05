import { sql, type Resident } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

// GET: List/search/filter residents (your original code)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const filterBy = searchParams.get("filterBy") || "student_number";

  let residents;
  if (search) {
    if (filterBy === "student_number") {
      residents = await sql<Resident[]>`
        SELECT * FROM residents
        WHERE student_number LIKE ${`%${search}%`}
        ORDER BY lname, fname
      `;
    } else if (filterBy === "name") {
      residents = await sql<Resident[]>`
        SELECT * FROM residents
        WHERE LOWER(fname) LIKE LOWER(${`%${search}%`})
        OR LOWER(lname) LIKE LOWER(${`%${search}%`})
        ORDER BY lname, fname
      `;
    }
  } else {
    residents = await sql<Resident[]>`
      SELECT * FROM residents ORDER BY lname, fname
    `;
  }

  return NextResponse.json(residents);
}

// POST: Add a new resident (for "Convert Applicant to Resident")
export async function POST(request: NextRequest) {
  const data = await request.json();
  const {
    student_number,
    fname,
    lname,
    email,
    course,
    emergency_contact,
    // add other fields if you have them
  } = data;

  // Insert into the residents table
  await sql`
    INSERT INTO residents (
      student_number,
      fname,
      lname,
      email,
      course,
      emergency_contact
    )
    VALUES (
      ${student_number},
      ${fname},
      ${lname},
      ${email},
      ${course},
      ${emergency_contact}
    )
  `;

  return NextResponse.json({ message: "Resident added successfully." }, { status: 201 });
}
