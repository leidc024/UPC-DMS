import { sql, type Building } from "@/lib/db"
import Link from "next/link"
import { Building2, Plus } from "lucide-react"

async function getBuildings() {
  const buildings = await sql<Building[]>`
    SELECT * FROM buildings ORDER BY building_id
  `
  return buildings
}

export default async function BuildingsPage() {
  const buildings = await getBuildings()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#7a1818]" />
            Buildings
          </h1>
          <p className="text-gray-600">Manage dormitory buildings</p>
        </div>
        <Link href="/buildings/add" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Building
        </Link>
      </div>

      {buildings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">No buildings found</p>
          <Link href="/buildings/add" className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Building
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildings.map((building) => (
            <div key={building.building_id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{building.name}</h2>
                <p className="text-gray-600 mb-4">{building.location}</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Capacity</p>
                    <p className="font-semibold">{building.capacity} rooms</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{building.description}</p>
                <div className="flex gap-2">
                  <Link href={`/buildings/${building.building_id}`} className="text-[#7a1818] hover:underline">
                    View Details
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link href={`/buildings/edit/${building.building_id}`} className="text-[#7a1818] hover:underline">
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
