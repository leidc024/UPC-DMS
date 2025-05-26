"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { addRoom } from "@/app/actions/room-actions"
import { getBuildings } from "@/app/actions/building-actions"
import type { Building } from "@/lib/db"

export default function AddRoomPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedBuildingId = searchParams.get("building")

  const [buildings, setBuildings] = useState<Building[]>([])
  const [formData, setFormData] = useState({
    building_id: preselectedBuildingId || "",
    room_number: "",
    floor: "",
    capacity: "",
    monthly_rate: "",
    is_occupied: "false",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadBuildings() {
      try {
        const data = await getBuildings()
        setBuildings(data)
      } catch (error) {
        console.error("Error loading buildings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBuildings()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await addRoom({
        building_id: Number.parseInt(formData.building_id),
        room_number: Number.parseInt(formData.room_number),
        floor: formData.floor, // Now string (M/F)
        capacity: Number.parseInt(formData.capacity),
        monthly_rate: Number.parseInt(formData.monthly_rate),
        is_occupied: formData.is_occupied === "true",
      })

      if (preselectedBuildingId) {
        router.push(`/buildings/${preselectedBuildingId}`)
      } else {
        router.push("/rooms")
      }
      router.refresh()
    } catch (error) {
      console.error("Error adding room:", error)
      setIsSubmitting(false)
    }
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
        href={preselectedBuildingId ? `/buildings/${preselectedBuildingId}` : "/rooms"}
        className="flex items-center gap-2 text-[#7a1818] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {preselectedBuildingId ? "Back to Building" : "Back to Rooms"}
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Room</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                Room Number*
              </label>
              <input
                type="number"
                id="room_number"
                name="room_number"
                value={formData.room_number}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
              />
            </div>

            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                Floor*
              </label>
              <select
                id="floor"
                name="floor"
                value={formData.floor}
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
                value={formData.capacity}
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
                value={formData.monthly_rate}
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
                value={formData.is_occupied}
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
              href={preselectedBuildingId ? `/buildings/${preselectedBuildingId}` : "/rooms"}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
