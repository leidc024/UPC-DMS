import { sql, type Applicant } from "@/lib/db"
import Link from "next/link"
import { FileUser, Plus, Search } from "lucide-react"

async function getApplicants() {
  const applicants = await sql<Applicant[]>`
    SELECT * FROM applicants ORDER BY lname, fname
  `
  return applicants
}

export default async function ApplicantsPage() {
  const applicants = await getApplicants()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileUser className="h-6 w-6 text-[#7a1818]" />
            Applicants
          </h1>
          <p className="text-gray-600">Manage dormitory applicants</p>
        </div>
        <Link href="/applicants/add" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Applicant
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search applicants..."
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
          />
        </div>

        {applicants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No Applicants found</p>
            <Link href="/applicants/add" className="btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Applicants
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Student Number</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Within Cebu</th>
                  <th className="px-4 py-2 text-left">Parents BIR</th>
                  <th className="px-4 py-2 text-left">Year Level</th>
                  <th className="px-4 py-2 text-left">Chances of Passing</th>
                  <th className="px-4 py-2 text-left">Emergency Contact</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((applicants) => (
                    <tr key={applicants.student_number} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{applicants.student_number}</td>
                    <td className="px-4 py-3">
                        {applicants.lname}, {applicants.fname}
                    </td>
                    <td className="px-4 py-3">{applicants.within_cebu ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">₱{applicants.parents_BIR.toLocaleString()}</td>
                    <td className="px-4 py-3">{applicants.year_level}</td>
                    <td className="px-4 py-3">
                        {(() => {
                        let chance = 0
                        if (!applicants.within_cebu) chance += 30

                        const bir = applicants.parents_BIR
                        if (bir <= 200000) chance += 30
                        else if (bir <= 300000) chance += 25
                        else if (bir <= 400000) chance += 20
                        else if (bir <= 500000) chance += 10

                        const year = applicants.year_level
                        if (year === 1) chance += 20
                        else if (year === 2) chance += 10

                        return chance
                        })()}
                    </td>
                    <td className="px-4 py-3">{applicants.emergency_contact}</td>
                    <td className="px-4 py-3 text-right">
                        <Link
                        href={`/applicants/${applicants.student_number}`}
                        className="text-[#7a1818] hover:underline mr-3"
                        >
                        Pass
                        </Link>
                        <Link
                        href={`/applicants/edit/${applicants.student_number}`}
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
