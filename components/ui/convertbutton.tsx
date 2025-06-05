'use client'

import { convertApplicantToResident } from "@/app/actions/applicants-actions"

export default function ConvertButton({ studentNumber }: { studentNumber: string }) {
  const handleConvert = async () => {
    try {
      await convertApplicantToResident(studentNumber)
    } catch (err) {
      console.error('Error converting applicant:', err)
    }
  }

  return (
    <button onClick={handleConvert} className="text-[#7a1818] hover:underline mr-3">
      Pass
    </button>
  )
}