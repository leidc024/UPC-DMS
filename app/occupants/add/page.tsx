"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { addOccupant } from "@/app/actions/occupant-actions"
import { getBuildings } from "@/app/actions/building-actions"
import { getResidents } from "@/app/actions/resident-actions"
import type { Building, Resident, Room } from "@/lib/db"

export default function AddOccupantPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedBuildingId = searchParams.get("building")
  const preselectedRoomNumber = searchParams.get("room")
  const preselectedStudentNumber = searchParams.get("student")

  const [buildings, setBuildings] = useState<Building[]>([])
  const [residents, setResidents] = useState<Resident[]>([])
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])

  const [formData, setFormData] = useState({
    student_number: preselectedStudentNumber || "",
    building_id: preselectedBuildingId || "",
    room_number: preselectedRoomNumber || "",
    check_in: new Date().toISOString().split("T")[0],
    check_out: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const buildingsData = await getBuildings()
        const residentsData = await getResidents()

        setBuildings(buildingsData)
        setResidents(residentsData)

        if (preselectedBuildingId) {
          await loadRooms(Number.parseInt(preselectedBuildingId))
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [preselectedBuildingId])

  async function loadRooms(buildingId: number) {
    try {
      // We need to use a client-side fetch here since we're in a client component
      const response = await fetch(`/api/rooms?buildingId=${buildingId}`)
      if (!response.ok) throw new Error("Failed to fetch rooms")
      const rooms = await response.json()
      setAvailableRooms(rooms)
    } catch (error) {
      console.error("Error loading rooms:", error)
      setAvailableRooms([])
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "building_id" && value) {
      setFormData((prev) => ({ ...prev, [name]: value, room_number: "" }))
      await loadRooms(Number.parseInt(value))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await addOccupant({
        student_number: formData.student_number,
        building_id: Number.parseInt(formData.building_id),
        room_number: formData.room_number,
        check_in: formData.check_in,
        check_out: formData.check_out || null,
      })

      // If we get here, the assignment was successful
      if (preselectedStudentNumber) {
        router.push(`/residents/${preselectedStudentNumber}`)
      } else if (preselectedBuildingId && preselectedRoomNumber) {
        router.push(`/rooms/${preselectedBuildingId}/${encodeURIComponent(preselectedRoomNumber)}`)
      } else {
        router.push("/rooms")
      }
      router.refresh()
    } catch (error) {
      console.error("Error adding occupant:", error)
      let errorMessage = "An unknown error occurred"

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      setError(errorMessage)
      setShowErrorModal(true)
      setIsSubmitting(false)
    }
  }

  const closeErrorModal = () => {
    setShowErrorModal(false)
    setError(null)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href={
          preselectedStudentNumber
            ? `/residents/${preselectedStudentNumber}`
            : preselectedBuildingId && preselectedRoomNumber
              ? `/rooms/${preselectedBuildingId}/${encodeURIComponent(preselectedRoomNumber)}`
              : "/rooms"
        }
        className="flex items-center gap-2 text-[#7a1818] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Assign Resident to Room</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="student_number" className="block text-sm font-medium text-gray-700 mb-1">
                Resident*
              </label>
              <select
                id="student_number"
                name="student_number"
                value={formData.student_number}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
                disabled={!!preselectedStudentNumber}
              >
                <option value="">Select Resident</option>
                {residents.map((resident) => (
                  <option key={resident.student_number} value={resident.student_number}>
                    {resident.lname}, {resident.fname} ({resident.student_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="building_id" className="block text-sm font-medium text-gray-700 mb-1">
                Building*
              </label>
              <select
                id="building_id"
                name="building_id"
                value={formData.building_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
                disabled={!!preselectedBuildingId}
              >
                <option value="">Select Building</option>
                {buildings.map((building) => (
                  <option key={building.building_id} value={building.building_id}>
                    {building.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="room_number" className="block text-sm font-medium text-gray-700 mb-1">
                Room*
              </label>
              <select
                id="room_number"
                name="room_number"
                value={formData.room_number}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
                disabled={!formData.building_id || !!preselectedRoomNumber}
              >
                <option value="">Select Room</option>
                {availableRooms.map((room) => (
                  <option key={room.room_number} value={room.room_number}>
                    Room {room.room_number} {room.is_occupied ? " - Occupied" : " - Available"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="check_in" className="block text-sm font-medium text-gray-700 mb-1">
                Check-in Date*
              </label>
              <input
                type="date"
                id="check_in"
                name="check_in"
                value={formData.check_in}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
              />
            </div>

            <div>
              <label htmlFor="check_out" className="block text-sm font-medium text-gray-700 mb-1">
                Check-out Date (Optional)
              </label>
              <input
                type="date"
                id="check_out"
                name="check_out"
                value={formData.check_out}
                onChange={handleChange}
                min={formData.check_in}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href={
                preselectedStudentNumber
                  ? `/residents/${preselectedStudentNumber}`
                  : preselectedBuildingId && preselectedRoomNumber
                    ? `/rooms/${preselectedBuildingId}/${encodeURIComponent(preselectedRoomNumber)}`
                    : "/rooms"
              }
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Assign Resident"}
            </button>
          </div>
        </form>
      </div>

      {/* Error Modal */}
      {showErrorModal && error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-red-800">Assignment Conflict</h2>
            </div>
            <p className="text-gray-700 mb-6">{error}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeErrorModal}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
