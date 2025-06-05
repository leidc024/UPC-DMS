import { sql, type Room } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const buildingId = searchParams.get("buildingId")

  if (!buildingId) {
    return NextResponse.json({ error: "Building ID is required" }, { status: 400 })
  }

  try {
    const rooms = await sql<Room[]>`
      SELECT * FROM rooms 
      WHERE building_id = ${Number.parseInt(buildingId)}
      ORDER BY room_number
    `

    return NextResponse.json(rooms)
  } catch (error) {
    console.error("Error fetching rooms:", error)
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 })
  }
}