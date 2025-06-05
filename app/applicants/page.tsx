import { sql, type Applicant } from "@/lib/db"
import Link from "next/link"
import { UserPlus, Plus, Search } from "lucide-react"
import ConvertButton from '@/components/ui/convertbutton'

async function getApplicants() {
  const applicants = await sql<Applicant[]>`
    SELECT * FROM applicants ORDER BY chance_of_passing DESC
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
            <UserPlus className="h-6 w-6 text-[#7a1818]" />
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
                  <th className="px-4 py-2 text-left">Parents Salary</th>
                  <th className="px-4 py-2 text-left">Year Level</th>
                  <th className="px-4 py-2 text-left">Chances of Passing</th>
                  <th className="px-4 py-2 text-left">Emergency Contact</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((applicant) => (
                    <tr key={applicant.student_number} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{applicant.student_number}</td>
                    <td className="px-4 py-3">
                        {applicant.lname}, {applicant.fname}
                    </td>
                    <td className="px-4 py-3">{applicant.within_cebu ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">₱{applicant.psalary.toLocaleString()}</td>
                    <td className="px-4 py-3">{applicant.year_level}</td>
                    <td className="px-4 py-3">{applicant.chance_of_passing}%</td>
                    <td className="px-4 py-3">{applicant.emergency_contact}</td>
                    <td className="px-4 py-3 text-right">
                        <ConvertButton studentNumber={applicant.student_number}/>
                        <Link
                        href={`/applicants/edit/${applicant.student_number}`}
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