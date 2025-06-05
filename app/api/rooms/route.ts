// /api/room/route.ts

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db"; // adjust import to your setup

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filterBy = searchParams.get("filterBy") || "building";
  const search = (searchParams.get("search") || "").toLowerCase();

  let where = "";
  let values: any[] = [];

  if (search) {
    if (filterBy === "building") {
      where = "LOWER(b.name) LIKE ?";
      values.push(`%${search}%`);
    } else if (filterBy === "room") {
      where = "LOWER(r.room_number) LIKE ?";
      values.push(`%${search}%`);
    }
  }

  const rooms = await sql<
    {
      room_id: number;
      room_number: string;
      building_name: string;
      capacity: number;
      current_occupants: number;
    }[]
  >(
    `
    SELECT 
      r.room_id,
      r.room_number,
      b.name AS building_name,
      r.capacity,
      COALESCE(
        (SELECT COUNT(*) 
         FROM occupants o 
         WHERE o.building_id = r.building_id 
           AND o.room_number = r.room_number 
           AND o.check_out IS NULL), 
        0
      ) AS current_occupants
    FROM rooms r
    JOIN buildings b ON r.building_id = b.building_id
    ${where ? `WHERE ${where}` : ""}
    ORDER BY b.name, r.room_number
    `,
    values
  );

  return NextResponse.json(rooms);
}
