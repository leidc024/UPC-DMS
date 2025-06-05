import { sql, type Room } from "@/lib/db"
import Link from "next/link"
import { DoorOpen, Plus, Search } from "lucide-react"

async function getRoomsWithOccupancy() {
  const rooms = await sql<
    (Room & {
      building_name: string
      current_occupants: number
      capacity: number
    })[]
  >`
    SELECT 
      r.*, 
      b.name as building_name,
      r.capacity,
      COALESCE(
        (SELECT COUNT(*) 
         FROM occupants o 
         WHERE o.building_id = r.building_id 
         AND o.room_number = r.room_number 
         AND o.check_out IS NULL), 
        0
      ) as current_occupants
    FROM rooms r
    JOIN buildings b ON r.building_id = b.building_id
    ORDER BY b.name, r.room_number
  `
  return rooms
}

export default async function RoomsPage() {
  const rooms = await getRoomsWithOccupancy()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DoorOpen className="h-6 w-6 text-[#7a1818]" />
            Rooms
          </h1>
          <p className="text-gray-600">Manage dormitory rooms</p>
        </div>
        <Link href="/rooms/add" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Room
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search rooms..."
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
          />
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No rooms found</p>
            <Link href="/rooms/add" className="btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Room
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Building</th>
                  <th className="px-4 py-2 text-left">Room Number</th>
                  <th className="px-4 py-2 text-left">Floor</th>
                  <th className="px-4 py-2 text-left">Capacity</th>
                  <th className="px-4 py-2 text-left">Monthly Rate</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={`${room.building_id}-${room.room_number}`} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{room.building_name}</td>
                    <td className="px-4 py-3">{room.room_number}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          room.floor === "M" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                        }`}
                      >
                        {room.floor === "M" ? "Male" : "Female"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{room.capacity} persons</td>
                    <td className="px-4 py-3">₱{room.monthly_rate.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          room.current_occupants >= room.capacity
                            ? "bg-red-100 text-red-800"
                            : room.current_occupants == 0
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {room.current_occupants >= room.capacity
                          ? "Full"
                          : room.current_occupants == 0
                            ? "Available"
                            : "Partially Occupied"}
                        ({room.current_occupants}/{room.capacity})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/rooms/${room.building_id}/${room.room_number}`}
                        className="text-[#7a1818] hover:underline mr-3"
                      >
                        View
                      </Link>
                      <Link
                        href={`/rooms/edit/${room.building_id}/${room.room_number}`}
                        className="text-[#7a1818] hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}