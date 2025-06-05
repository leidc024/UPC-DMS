import Link from "next/link"
import Image from "next/image"
import { LayoutDashboard, Info, Building2, Users, DoorOpen, UserPlus } from "lucide-react"

export default function Header() {
  return (
    <header className="bg-[#7a1818] text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 relative">
              <Image
                src="/up-cebu-logo.png"
                alt="UP Cebu Logo"
                width={40}
                height={40}
                className="rounded-full object-contain"
              />
            </div>
            <div className="font-semibold leading-tight">
              <div className="text-sm">UNIVERSITY OF THE PHILIPPINES</div>
              <div className="text-lg">CEBU</div>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 hover:text-gray-200">
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/overview" className="flex items-center gap-2 hover:text-gray-200">
            <Info className="h-5 w-5" />
            <span>Overview</span>
          </Link>
          <Link href="/buildings" className="flex items-center gap-2 hover:text-gray-200">
            <Building2 className="h-5 w-5" />
            <span>Buildings</span>
          </Link>
          <Link href="/residents" className="flex items-center gap-2 hover:text-gray-200">
            <Users className="h-5 w-5" />
            <span>Residents</span>
          </Link>
          <Link href="/rooms" className="flex items-center gap-2 hover:text-gray-200">
            <DoorOpen className="h-5 w-5" />
            <span>Rooms</span>
          </Link>
          <Link href="/applicants" className="flex items-center gap-2 hover:text-gray-200">
            <UserPlus className="h-5 w-5" />
            <span>Applicants</span>
          </Link>
        </nav>

        <div className="text-lg font-semibold">Dormitory Management System</div>
      </div>
    </header>
  )
}
