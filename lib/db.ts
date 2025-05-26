import { neon } from "@neondatabase/serverless"

// Create a SQL client with the Neon database URL
export const sql = neon(process.env.DATABASE_URL!)

// Building type
export type Building = {
  building_id: number
  name: string
  location: string
  capacity: number
  description: string
}

// Resident type
export type Resident = {
  student_number: string
  fname: string
  lname: string
  course: string
  year_level: number
  email: string
  emergency_contact: string
}

// Room type - Updated floor to be string (M/F)
export type Room = {
  building_id: number
  room_number: number
  floor: string // Changed from number to string for M/F designation
  capacity: number
  monthly_rate: number
  is_occupied: boolean
  building_name?: string // For joined queries
}

// Occupant type
export type Occupant = {
  occupant_id: number
  student_number: string
  building_id: number
  room_number: number
  check_in: string
  check_out: string | null
  resident_name?: string // For joined queries
  building_name?: string // For joined queries
}
