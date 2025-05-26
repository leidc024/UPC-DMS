import { sql, type Building, type Room } from "@/lib/db"
import Link from "next/link"
import { ArrowLeft, Building2, Edit, DoorOpen } from "lucide-react"

async function getBuilding(id: number) {
  const buildings = await sql<Building[]>`
    SELECT * FROM buildings WHERE building_id = ${id}
  `
  return buildings[0] || null
}

async function getBuildingRoomsWithOccupancy(id: number) {
  const rooms = await sql<(Room & { current_occupants: number })[]>`
    SELECT 
      r.*,
      COALESCE(
        (SELECT COUNT(*) 
         FROM occupants o 
         WHERE o.building_id = r.building_id 
         AND o.room_number = r.room_number 
         AND o.check_out IS NULL), 
        0
      ) as current_occupants
    FROM rooms r
    WHERE r.building_id = ${id} 
    ORDER BY r.room_number
  `
  return rooms
}

export default async function BuildingDetailsPage({ params }: { params: { id: string } }) {
  const buildingId = Number.parseInt(params.id)
  const building = await getBuilding(buildingId)
  const rooms = await getBuildingRoomsWithOccupancy(buildingId)

  if (!building) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-red-500 mb-4">Building not found</p>
          <Link href="/buildings" className="btn-primary">
            Back to Buildings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/buildings" className="flex items-center gap-2 text-[#7a1818] mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Buildings
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-[#7a1818]" />
            <div>
              <h1 className="text-2xl font-bold">{building.name}</h1>
              <p className="text-gray-600">{building.location}</p>
            </div>
          </div>
          <Link
            href={`/buildings/edit/${building.building_id}`}
            className="flex items-center gap-2 text-[#7a1818] hover:underline"
          >
            <Edit className="h-4 w-4" />
            Edit Building
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500">Capacity</p>
            <p className="font-semibold">{building.capacity} rooms</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Available Rooms</p>
            <p className="font-semibold">
              {rooms.filter((room) => room.current_occupants < room.capacity).length} rooms
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Occupancy Rate</p>
            <p className="font-semibold">
              {rooms.length > 0
                ? `${Math.round(
                    (rooms.reduce((sum, room) => sum + room.current_occupants, 0) /
                      rooms.reduce((sum, room) => sum + room.capacity, 0)) *
                      100,
                  )}%`
                : "0%"}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{building.description || "No description available."}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <DoorOpen className="h-6 w-6 text-[#7a1818]" />
            <h2 className="text-xl font-semibold">Rooms</h2>
          </div>
          <Link href={`/rooms/add?building=${buildingId}`} className="btn-primary">
            Add Room
          </Link>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No rooms found for this building</p>
            <Link href={`/rooms/add?building=${buildingId}`} className="btn-primary">
              Add Room
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
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
                            : room.current_occupants === 0
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {room.current_occupants >= room.capacity
                          ? "Full"
                          : room.current_occupants === 0
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
