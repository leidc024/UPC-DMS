import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  if (!id) {
    return NextResponse.json({ error: "Occupant ID is required" }, { status: 400 })
  }

  try {
    const occupants = await sql`
      SELECT o.*, 
        CONCAT(r.fname, ' ', r.lname) as resident_name,
        b.name as building_name
      FROM occupants o
      JOIN residents r ON o.student_number = r.student_number
      JOIN buildings b ON o.building_id = b.building_id
      WHERE o.occupant_id = ${Number.parseInt(id)}
    `

    if (occupants.length === 0) {
      return NextResponse.json({ error: "Occupant not found" }, { status: 404 })
    }

    return NextResponse.json(occupants[0])
  } catch (error) {
    console.error("Error fetching occupant:", error)
    return NextResponse.json({ error: "Failed to fetch occupant" }, { status: 500 })
  }
}
