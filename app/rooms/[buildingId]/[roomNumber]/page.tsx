import { sql, type Room, type Building } from "@/lib/db"
import Link from "next/link"
import { ArrowLeft, Building2, DoorOpen, Edit, User } from "lucide-react"
import { getOccupantsByRoom } from "@/app/actions/occupant-actions"

async function getRoom(buildingId: number, roomNumber: number) {
  const rooms = await sql<Room[]>`
    SELECT * FROM rooms WHERE building_id = ${buildingId} AND room_number = ${roomNumber}
  `
  return rooms[0] || null
}

async function getBuilding(id: number) {
  const buildings = await sql<Building[]>`
    SELECT * FROM buildings WHERE building_id = ${id}
  `
  return buildings[0] || null
}

export default async function RoomDetailsPage({
  params,
}: {
  params: { buildingId: string; roomNumber: string }
}) {
  const buildingId = Number.parseInt(params.buildingId)
  const roomNumber = Number.parseInt(params.roomNumber)

  const room = await getRoom(buildingId, roomNumber)
  const building = await getBuilding(buildingId)
  const occupants = await getOccupantsByRoom(buildingId, roomNumber)

  if (!room || !building) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-red-500 mb-4">Room not found</p>
          <Link href="/rooms" className="btn-primary">
            Back to Rooms
          </Link>
        </div>
      </div>
    )
  }

  // Get current active occupants
  const activeOccupants = occupants.filter((o) => o.check_out === null)
  const occupancyStatus =
    activeOccupants.length >= room.capacity ? "Full" : activeOccupants.length === 0 ? "Available" : "Partially Occupied"

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/rooms" className="flex items-center gap-2 text-[#7a1818] mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Rooms
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <DoorOpen className="h-8 w-8 text-[#7a1818]" />
              <h1 className="text-2xl font-bold">Room {room.room_number}</h1>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="h-4 w-4" />
              <Link href={`/buildings/${building.building_id}`} className="hover:underline">
                {building.name}
              </Link>
            </div>
          </div>
          <Link
            href={`/rooms/edit/${buildingId}/${roomNumber}`}
            className="flex items-center gap-2 text-[#7a1818] hover:underline"
          >
            <Edit className="h-4 w-4" />
            Edit Room
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500">Floor</p>
            <p className="font-semibold">
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  room.floor === "M" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                }`}
              >
                {room.floor === "M" ? "Male" : "Female"}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Capacity</p>
            <p className="font-semibold">{room.capacity} persons</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Monthly Rate</p>
            <p className="font-semibold">₱{room.monthly_rate.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <div
            className={`px-3 py-1 rounded-full text-sm ${
              occupancyStatus === "Full"
                ? "bg-red-100 text-red-800"
                : occupancyStatus === "Available"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {occupancyStatus} ({activeOccupants.length}/{room.capacity})
          </div>

          {occupancyStatus !== "Full" && (
            <Link
              href={`/occupants/add?building=${buildingId}&room=${roomNumber}`}
              className="text-[#7a1818] hover:underline"
            >
              Assign Resident
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-[#7a1818]" />
            <h2 className="text-xl font-semibold">Occupants</h2>
          </div>
          <Link href={`/occupants/add?building=${buildingId}&room=${roomNumber}`} className="btn-primary">
            Assign Resident
          </Link>
        </div>

        {occupants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No occupancy history found</p>
            <Link href={`/occupants/add?building=${buildingId}&room=${roomNumber}`} className="btn-primary">
              Assign Resident
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Resident</th>
                  <th className="px-4 py-2 text-left">Check-in Date</th>
                  <th className="px-4 py-2 text-left">Check-out Date</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {occupants.map((occupant) => (
                  <tr key={occupant.occupant_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{occupant.resident_name}</td>
                    <td className="px-4 py-3">{new Date(occupant.check_in).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {occupant.check_out ? new Date(occupant.check_out).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          occupant.check_out === null ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {occupant.check_out === null ? "Active" : "Past"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/residents/${occupant.student_number}`}
                        className="text-[#7a1818] hover:underline mr-3"
                      >
                        View Resident
                      </Link>
                      {occupant.check_out === null && (
                        <Link
                          href={`/occupants/checkout/${occupant.occupant_id}`}
                          className="text-[#7a1818] hover:underline"
                        >
                          Check Out
                        </Link>
                      )}
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
