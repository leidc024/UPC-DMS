import { Users, Plus } from "lucide-react";
import Link from "next/link";
import ResidentsList from "./ResidentsList"; // This is the only content that changes!

export default function ResidentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-[#7a1818]" />
            Residents
          </h1>
          <p className="text-gray-600">Manage dormitory residents</p>
        </div>
        <Link href="/residents/add" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Resident
        </Link>
      </div>
      {/* NEW: Client-side list with search */}
      <ResidentsList />
    </div>
  );
}
