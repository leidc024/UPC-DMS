import Link from "next/link"
import { Building2, Users, DoorOpen } from "lucide-react"
import { sql } from "@/lib/db"

async function getStats() {
  const buildingsCount = await sql`SELECT COUNT(*) FROM buildings`
  const residentsCount = await sql`SELECT COUNT(*) FROM residents`
  const roomsCount = await sql`SELECT COUNT(*) FROM rooms`

  return {
    buildings: Number.parseInt(buildingsCount[0].count) || 0,
    residents: Number.parseInt(residentsCount[0].count) || 0,
    rooms: Number.parseInt(roomsCount[0].count) || 0,
  }
}

export default async function Home() {
  const stats = await getStats()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-[#7a1818] text-white rounded-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">UP Cebu Dormitory Management System</h1>
        <p className="text-lg">
          Efficiently manage dormitory facilities, residents, and room assignments at University of the Philippines
          Cebu.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-6 w-6 text-[#7a1818]" />
            <h2 className="section-title">Buildings</h2>
          </div>
          <p className="stat-label">Total buildings</p>
          <p className="stat-value">{stats.buildings}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-6 w-6 text-[#7a1818]" />
            <h2 className="section-title">Residents</h2>
          </div>
          <p className="stat-label">Total residents</p>
          <p className="stat-value">{stats.residents}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <DoorOpen className="h-6 w-6 text-[#7a1818]" />
            <h2 className="section-title">Rooms</h2>
          </div>
          <p className="stat-label">Total rooms</p>
          <p className="stat-value">{stats.rooms}</p>
        </div>
      </div>

      {/* Management Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-6 w-6 text-[#7a1818]" />
            <h2 className="section-title">Buildings</h2>
          </div>
          <p className="section-subtitle">Manage UP Cebu dormitory buildings</p>
          <p className="mb-6">Add, edit, and remove buildings in the UP Cebu dormitory system.</p>
          <Link href="/buildings" className="btn-primary block text-center">
            Manage Buildings
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-6 w-6 text-[#7a1818]" />
            <h2 className="section-title">Residents</h2>
          </div>
          <p className="section-subtitle">Manage dormitory residents</p>
          <p className="mb-6">Add, edit, and remove resident information and details.</p>
          <Link href="/residents" className="btn-primary block text-center">
            Manage Residents
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <DoorOpen className="h-6 w-6 text-[#7a1818]" />
            <h2 className="section-title">Rooms</h2>
          </div>
          <p className="section-subtitle">Manage dormitory rooms</p>
          <p className="mb-6">Add, edit, and remove rooms and assign residents to rooms.</p>
          <Link href="/rooms" className="btn-primary block text-center">
            Manage Rooms
          </Link>
        </div>
      </div>
    </div>
  )
}
