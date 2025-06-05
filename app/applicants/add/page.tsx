"use client"

import type React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { addApplicants } from "@/app/actions/applicants-actions"

export default function AddApplicantsPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    student_number: "",
    fname: "",
    lname: "",
    within_cebu: "",
    psalary: "",
    year_level: "",
    chance_of_passing: "",
    emergency_contact: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let chance = 0

    if (!formData.within_cebu) chance += 30

    const bir = parseFloat(formData.psalary)
    if (!isNaN(bir)) {
      if (bir <= 200000) chance += 30
      else if (bir <= 300000) chance += 25
      else if (bir <= 400000) chance += 20
      else if (bir <= 500000) chance += 10
    }

    const year = parseInt(formData.year_level)
    if (year === 1) chance += 20
    else if (year === 2) chance += 10

    setFormData((prev) => ({
      ...prev,
      chance_of_passing: `${chance}`
    }))
  }, [formData.within_cebu, formData.psalary, formData.year_level])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target
  setFormData((prev) => ({
    ...prev,
    [name]: name === "within_cebu" ? value === "true" : value
  }))
}


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      console.log("Submitting applicants data:", {
        ...formData,
        year_level: Number.parseInt(formData.year_level),
      })

      await addApplicants({
        ...formData,
        year_level: Number.parseInt(formData.year_level),
      })

      router.push("/applicants")
      router.refresh()
    } catch (error) {
      console.error("Error adding applicant:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/applicants" className="flex items-center gap-2 text-[#7a1818] mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Applicants
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Applicant</h1>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="student_number" className="block text-sm font-medium text-gray-700 mb-1">
                Student Number*
              </label>
              <input
                type="text"
                id="student_number"
                name="student_number"
                value={formData.student_number}
                onChange={handleChange}
                required
                placeholder="e.g., 2022-55121"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
              />
            </div>
            <div>
              <label htmlFor="fname" className="block text-sm font-medium text-gray-700 mb-1">
                First Name*
              </label>
              <input
                type="text"
                id="fname"
                name="fname"
                value={formData.fname}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
              />
            </div>

            <div>
              <label htmlFor="lname" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name*
              </label>
              <input
                type="text"
                id="lname"
                name="lname"
                value={formData.lname}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
              />
            </div>

            <div>
                <label htmlFor="within_cebu" className="block text-sm font-medium text-gray-700 mb-1">
                    Within Cebu*
                </label>
                <select
                    id="within_cebu"
                    name="within_cebu"
                    value={formData.within_cebu}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
                >
                    <option value="">Select an option</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            </div>

            <div>
              <label htmlFor="lname" className="block text-sm font-medium text-gray-700 mb-1">
                Parents Salary*
              </label>
              <input
                type="number"
                id="psalary"
                name="psalary"
                value={formData.psalary}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
              />
            </div>

            <div>
              <label htmlFor="year_level" className="block text-sm font-medium text-gray-700 mb-1">
                Year Level*
              </label>
              <select
                id="year_level"
                name="year_level"
                value={formData.year_level}
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

            <div>
                <label htmlFor="chance_of_passing" className="block text-sm font-medium text-gray-700 mb-1">
                    Chance of Passing*
                </label>
                <input
                    type="text"
                    id="chance_of_passing"
                    name="chance_of_passing"
                    value={formData.chance_of_passing}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 bg-gray-100 text-gray-500 rounded-md cursor-not-allowed focus:outline-none"
                    placeholder="Can't change. Value will be calculated based on other inputs."
                />
            </div>


            <div>
              <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact*
              </label>
              <input
                type="text"
                id="emergency_contact"
                name="emergency_contact"
                value={formData.emergency_contact}
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
              {isSubmitting ? "Saving..." : "Save Applicant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
