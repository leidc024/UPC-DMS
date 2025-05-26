import { sql } from "@/lib/db"
import { Building2, Users, DoorOpen, Home } from "lucide-react"

async function getOverviewStats() {
  const buildingsCount = await sql`SELECT COUNT(*) FROM buildings`
  const residentsCount = await sql`SELECT COUNT(*) FROM residents`
  const roomsCount = await sql`SELECT COUNT(*) FROM rooms`
  const occupiedRoomsCount = await sql`SELECT COUNT(*) FROM rooms WHERE is_occupied = true`
  const activeOccupantsCount = await sql`SELECT COUNT(*) FROM occupants WHERE check_out IS NULL`

  // Get occupancy rate per building
  const buildingStats = await sql`
    SELECT 
      b.building_id,
      b.name,
      COUNT(r.room_number) as total_rooms,
      SUM(CASE WHEN r.is_occupied THEN 1 ELSE 0 END) as occupied_rooms
    FROM buildings b
    LEFT JOIN rooms r ON b.building_id = r.building_id
    GROUP BY b.building_id, b.name
    ORDER BY b.name
  `

  return {
    buildings: Number.parseInt(buildingsCount[0].count) || 0,
    residents: Number.parseInt(residentsCount[0].count) || 0,
    rooms: Number.parseInt(roomsCount[0].count) || 0,
    occupiedRooms: Number.parseInt(occupiedRoomsCount[0].count) || 0,
    activeOccupants: Number.parseInt(activeOccupantsCount[0].count) || 0,
    buildingStats,
  }
}

export default async function OverviewPage() {
  const stats = await getOverviewStats()

  // Calculate overall occupancy rate
  const occupancyRate = stats.rooms > 0 ? Math.round((stats.occupiedRooms / stats.rooms) * 100) : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">System Overview</h1>
        <p className="text-gray-600">Dashboard overview of the UP Cebu Dormitory Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Buildings</p>
              <p className="text-2xl font-bold">{stats.buildings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Residents</p>
              <p className="text-2xl font-bold">{stats.residents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <DoorOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rooms</p>
              <p className="text-2xl font-bold">{stats.rooms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <Home className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Occupants</p>
              <p className="text-2xl font-bold">{stats.activeOccupants}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Overall Occupancy</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold text-[#7a1818]">{occupancyRate}%</div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#7a1818]" style={{ width: `${occupancyRate}%` }}></div>
              </div>
              <div className="flex justify-between mt-1 text-sm text-gray-500">
                <span>{stats.occupiedRooms} occupied</span>
                <span>{stats.rooms - stats.occupiedRooms} available</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Rooms</p>
              <p className="text-xl font-semibold">{stats.rooms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Occupied Rooms</p>
              <p className="text-xl font-semibold">{stats.occupiedRooms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Available Rooms</p>
              <p className="text-xl font-semibold">{stats.rooms - stats.occupiedRooms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Occupancy Rate</p>
              <p className="text-xl font-semibold">{occupancyRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Building Occupancy</h2>

        {stats.buildingStats.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No buildings found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Building</th>
                  <th className="px-4 py-2 text-left">Total Rooms</th>
                  <th className="px-4 py-2 text-left">Occupied</th>
                  <th className="px-4 py-2 text-left">Available</th>
                  <th className="px-4 py-2 text-left">Occupancy Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.buildingStats.map((building: any) => {
                  const buildingOccupancyRate =
                    building.total_rooms > 0
                      ? Math.round(
                          (Number.parseInt(building.occupied_rooms) / Number.parseInt(building.total_rooms)) * 100,
                        )
                      : 0

                  return (
                    <tr key={building.building_id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{building.name}</td>
                      <td className="px-4 py-3">{building.total_rooms}</td>
                      <td className="px-4 py-3">{building.occupied_rooms}</td>
                      <td className="px-4 py-3">
                        {Number.parseInt(building.total_rooms) - Number.parseInt(building.occupied_rooms)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#7a1818]" style={{ width: `${buildingOccupancyRate}%` }}></div>
                          </div>
                          <span>{buildingOccupancyRate}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
