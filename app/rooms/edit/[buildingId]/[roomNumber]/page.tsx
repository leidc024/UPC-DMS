"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getRoom, updateRoom, deleteRoom } from "@/app/actions/room-actions"
import { getBuilding } from "@/app/actions/building-actions"
import type { Room, Building } from "@/lib/db"

export default function EditRoomPage({
  params,
}: {
  params: { buildingId: string; roomNumber: string }
}) {
  const router = useRouter()
  const buildingId = Number.parseInt(params.buildingId)
  const roomNumber = Number.parseInt(params.roomNumber)

  const [room, setRoom] = useState<Room | null>(null)
  const [building, setBuilding] = useState<Building | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const roomData = await getRoom(buildingId, roomNumber)
        const buildingData = await getBuilding(buildingId)
        setRoom(roomData)
        setBuilding(buildingData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [buildingId, roomNumber])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setRoom((prev) => {
      if (!prev) return null

      if (name === "is_occupied") {
        return { ...prev, [name]: value === "true" }
      }

      return {
        ...prev,
        [name]: ["capacity", "monthly_rate"].includes(name) ? Number.parseInt(value) : value,
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!room) return

    setIsSubmitting(true)
    try {
      await updateRoom(buildingId, roomNumber, room)
      router.push(`/rooms/${buildingId}/${roomNumber}`)
      router.refresh()
    } catch (error) {
      console.error("Error updating room:", error)
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await deleteRoom(buildingId, roomNumber)
      router.push(`/buildings/${buildingId}`)
      router.refresh()
    } catch (error) {
      console.error("Error deleting room:", error)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p>Loading room information...</p>
        </div>
      </div>
    )
  }

  if (!room || !building) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-red-500 mb-4">Room not found</p>
          <Link href="/rooms" className="btn-primary">
            Back to Rooms
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={`/rooms/${buildingId}/${roomNumber}`} className="flex items-center gap-2 text-[#7a1818] mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Room
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Room {room.room_number}</h1>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete Room
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-1">
                Building
              </label>
              <input
                type="text"
                id="building"
                value={building.name}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="room_number" className="block text-sm font-medium text-gray-700 mb-1">
                Room Number
              </label>
              <input
                type="number"
                id="room_number"
                value={room.room_number}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                Floor*
              </label>
              <select
                id="floor"
                name="floor"
                value={room.floor || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
              >
                <option value="">Select Floor</option>
                <option value="M">Male (M)</option>
                <option value="F">Female (F)</option>
              </select>
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                Capacity (persons)*
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={room.capacity || ""}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
              />
            </div>

            <div>
              <label htmlFor="monthly_rate" className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rate (₱)*
              </label>
              <input
                type="number"
                id="monthly_rate"
                name="monthly_rate"
                value={room.monthly_rate || ""}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
              />
            </div>

            <div>
              <label htmlFor="is_occupied" className="block text-sm font-medium text-gray-700 mb-1">
                Status*
              </label>
              <select
                id="is_occupied"
                name="is_occupied"
                value={room.is_occupied.toString()}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
              >
                <option value="false">Available</option>
                <option value="true">Occupied</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href={`/rooms/${buildingId}/${roomNumber}`}
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
              Are you sure you want to delete Room {room.room_number} in {building.name}? This action cannot be undone
              and will remove all associated occupant records.
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
                {isSubmitting ? "Deleting..." : "Delete Room"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
