"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { updateOccupant } from "@/app/actions/occupant-actions"

type OccupantDetails = {
  occupant_id: number
  student_number: number
  building_id: number
  room_number: number
  check_in: string
  check_out: string | null
  resident_name: string
  building_name: string
}

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const occupantId = Number.parseInt(params.id)

  const [occupant, setOccupant] = useState<OccupantDetails | null>(null)
  const [checkoutDate, setCheckoutDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadOccupant() {
      try {
        // We need to use a client-side fetch here since we're in a client component
        const response = await fetch(`/api/occupants/${occupantId}`)
        if (!response.ok) throw new Error("Failed to fetch occupant")
        const data = await response.json()
        setOccupant(data)
      } catch (error) {
        console.error("Error loading occupant:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOccupant()
  }, [occupantId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!occupant) return

    setIsSubmitting(true)
    try {
      await updateOccupant(occupantId, {
        ...occupant,
        check_out: checkoutDate,
      })

      // Redirect based on where the user likely came from
      if (occupant.student_number) {
        router.push(`/residents/${occupant.student_number}`)
      } else {
        router.push(`/rooms/${occupant.building_id}/${occupant.room_number}`)
      }
      router.refresh()
    } catch (error) {
      console.error("Error checking out occupant:", error)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p>Loading occupant information...</p>
        </div>
      </div>
    )
  }

  if (!occupant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-red-500 mb-4">Occupant record not found</p>
          <Link href="/rooms" className="btn-primary">
            Back to Rooms
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href={`/rooms/${occupant.building_id}/${occupant.room_number}`}
        className="flex items-center gap-2 text-[#7a1818] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Room
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Check Out Resident</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500">Resident</p>
            <p className="font-semibold">{occupant.resident_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Room</p>
            <p className="font-semibold">
              {occupant.building_name}, Room {occupant.room_number}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Check-in Date</p>
            <p className="font-semibold">{new Date(occupant.check_in).toLocaleDateString()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="check_out" className="block text-sm font-medium text-gray-700 mb-1">
              Check-out Date*
            </label>
            <input
              type="date"
              id="check_out"
              value={checkoutDate}
              onChange={(e) => setCheckoutDate(e.target.value)}
              required
              min={occupant.check_in}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href={`/rooms/${occupant.building_id}/${occupant.room_number}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-50">
              {isSubmitting ? "Processing..." : "Confirm Check Out"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
