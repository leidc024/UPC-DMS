import { sql, type Resident } from "@/lib/db"
import Link from "next/link"
import { Users, Plus, Search } from "lucide-react"

async function getResidents() {
  const residents = await sql<Resident[]>`
    SELECT * FROM residents ORDER BY lname, fname
  `
  return residents
}

export default async function ResidentsPage() {
  const residents = await getResidents()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-[#7a1818]" />
            Residents
          </h1>
          <p className="text-gray-600">Manage dormitory residents</p>
        </div>
        <Link href="/residents/add" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Resident
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search residents..."
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
          />
        </div>

        {residents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No residents found</p>
            <Link href="/residents/add" className="btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Resident
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Student Number</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Course</th>
                  <th className="px-4 py-2 text-left">Year Level</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((resident) => (
                  <tr key={resident.student_number} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{resident.student_number}</td>
                    <td className="px-4 py-3">
                      {resident.lname}, {resident.fname}
                    </td>
                    <td className="px-4 py-3">{resident.course}</td>
                    <td className="px-4 py-3">{resident.year_level}</td>
                    <td className="px-4 py-3">{resident.email}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/residents/${resident.student_number}`}
                        className="text-[#7a1818] hover:underline mr-3"
                      >
                        View
                      </Link>
                      <Link
                        href={`/residents/edit/${resident.student_number}`}
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
