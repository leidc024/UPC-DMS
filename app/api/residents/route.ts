import { sql, type Resident } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

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
