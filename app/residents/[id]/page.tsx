import { sql, type Resident } from "@/lib/db"
import Link from "next/link"
import { ArrowLeft, User, Edit, DoorOpen } from "lucide-react"
import { getOccupantsByResident } from "@/app/actions/occupant-actions"

async function getResident(id: string) {
  const residents = await sql<Resident[]>`
    SELECT * FROM residents WHERE student_number = ${id}
  `
  return residents[0] || null
}

export default async function ResidentDetailsPage({ params }: { params: { id: string } }) {
  const studentNumber = params.id
  const resident = await getResident(studentNumber)
  const occupants = await getOccupantsByResident(studentNumber)

  if (!resident) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-red-500 mb-4">Resident not found</p>
          <Link href="/residents" className="btn-primary">
            Back to Residents
          </Link>
        </div>
      </div>
    )
  }

  // Check if resident has an active occupancy
  const activeOccupancy = occupants.find((o) => o.check_out === null)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/residents" className="flex items-center gap-2 text-[#7a1818] mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Residents
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-[#7a1818]" />
            <div>
              <h1 className="text-2xl font-bold">
                {resident.lname}, {resident.fname}
              </h1>
              <p className="text-gray-600">Student Number: {resident.student_number}</p>
            </div>
          </div>
          <Link
            href={`/residents/edit/${resident.student_number}`}
            className="flex items-center gap-2 text-[#7a1818] hover:underline"
          >
            <Edit className="h-4 w-4" />
            Edit Resident
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500">Course</p>
            <p className="font-semibold">{resident.course}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Year Level</p>
            <p className="font-semibold">{resident.year_level}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-semibold">{resident.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Emergency Contact</p>
            <p className="font-semibold">{resident.emergency_contact}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <div
            className={`px-3 py-1 rounded-full text-sm ${
              activeOccupancy ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {activeOccupancy ? "Currently Residing" : "Not Currently Residing"}
          </div>

          {activeOccupancy && (
            <Link
              href={`/rooms/${activeOccupancy.building_id}/${activeOccupancy.room_number}`}
              className="text-[#7a1818] hover:underline flex items-center gap-1"
            >
              <DoorOpen className="h-4 w-4" />
              View Current Room
            </Link>
          )}

          {!activeOccupancy && (
            <Link href={`/occupants/add?student=${resident.student_number}`} className="text-[#7a1818] hover:underline">
              Assign to Room
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <DoorOpen className="h-6 w-6 text-[#7a1818]" />
            <h2 className="text-xl font-semibold">Occupancy History</h2>
          </div>
          <Link href={`/occupants/add?student=${resident.student_number}`} className="btn-primary">
            Assign to Room
          </Link>
        </div>

        {occupants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No occupancy history found</p>
            <Link href={`/occupants/add?student=${resident.student_number}`} className="btn-primary">
              Assign to Room
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Building</th>
                  <th className="px-4 py-2 text-left">Room</th>
                  <th className="px-4 py-2 text-left">Check-in Date</th>
                  <th className="px-4 py-2 text-left">Check-out Date</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {occupants.map((occupant) => (
                  <tr key={occupant.occupant_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{occupant.building_name}</td>
                    <td className="px-4 py-3">{occupant.room_number}</td>
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
                        href={`/rooms/${occupant.building_id}/${occupant.room_number}`}
                        className="text-[#7a1818] hover:underline mr-3"
                      >
                        View Room
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
