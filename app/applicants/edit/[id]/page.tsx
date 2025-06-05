"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getApplicant, updateApplicant, deleteApplicant } from "@/app/actions/applicants-actions"
import type { Applicant } from "@/lib/db"

export default function EditApplicantPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const studentNumber = params.id

  const [applicant, setApplicant] = useState<Applicant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    async function loadApplicant() {
      try {
        const data = await getApplicant(studentNumber)
        setApplicant(data)
      } catch (error) {
        console.error("Error loading applicant:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadApplicant()
  }, [studentNumber])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setApplicant((prev) =>
      prev
        ? {
            ...prev,
            [name]:
              name === "psalary" || name === "year_level" || name === "chance_of_passing"
                ? value === "" ? null : Number(value)
                : value,
          }
        : null,
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!applicant) return
    setIsSubmitting(true)
    try {
      await updateApplicant(studentNumber, applicant)
      router.push("/applicants")
      router.refresh()
    } catch (error) {
      console.error("Error updating applicant:", error)
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await deleteApplicant(studentNumber)
      router.push("/applicants")
      router.refresh()
    } catch (error) {
      console.error("Error deleting applicant:", error)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p>Loading applicant information...</p>
        </div>
      </div>
    )
  }

  if (!applicant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-red-500 mb-4">Applicant not found</p>
          <Link href="/applicants" className="btn-primary">
            Back to Applicants
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/applicants" className="flex items-center gap-2 text-[#7a1818] mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Applicants
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Applicant</h1>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete Applicant
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Student Number (disabled) */}
            <div>
              <label htmlFor="student_number" className="block text-sm font-medium text-gray-700 mb-1">
                Student Number
              </label>
              <input
                type="text"
                id="student_number"
                name="student_number"
                value={applicant.student_number}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
            {/* Last Name */}
            <div>
              <label htmlFor="lname" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name*
              </label>
              <input
                type="text"
                id="lname"
                name="lname"
                value={applicant.lname || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
              />
            </div>
            {/* First Name */}
            <div>
              <label htmlFor="fname" className="block text-sm font-medium text-gray-700 mb-1">
                First Name*
              </label>
              <input
                type="text"
                id="fname"
                name="fname"
                value={applicant.fname || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
              />
            </div>
            {/* Within Cebu */}
            <div>
              <label htmlFor="within_cebu" className="block text-sm font-medium text-gray-700 mb-1">
                Within Cebu*
              </label>
              <select
                id="within_cebu"
                name="within_cebu"
                value={applicant.within_cebu || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {/* Parent's Salary */}
            <div>
              <label htmlFor="psalary" className="block text-sm font-medium text-gray-700 mb-1">
                Parents Salary
              </label>
              <input
                type="number"
                id="psalary"
                name="psalary"
                value={applicant.psalary ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
                min="0"
                step="any"
              />
            </div>
            {/* Year Level */}
            <div>
              <label htmlFor="year_level" className="block text-sm font-medium text-gray-700 mb-1">
                Year Level*
              </label>
              <select
                id="year_level"
                name="year_level"
                value={applicant.year_level ?? ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
              >
                <option value="">Select Year Level</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="5">5th Year</option>
                <option value="6">Graduate Student</option>
              </select>
            </div>
            {/* Emergency Contact */}
            <div>
              <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact*
              </label>
              <input
                type="text"
                id="emergency_contact"
                name="emergency_contact"
                value={applicant.emergency_contact || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href="/applicants"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {applicant.fname} {applicant.lname}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Delete Applicant"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
