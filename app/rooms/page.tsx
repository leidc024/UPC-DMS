"use client";

import { useState, useEffect } from "react";
import { DoorOpen, Plus, Search } from "lucide-react";
import Link from "next/link";
import RoomsList from "@/app/residents/RoomsList";

export default function RoomPage() {
  const [filterBy, setFilterBy] = useState<"building" | "room">("building");
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch rooms from the API with current filters
  const fetchRooms = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("filterBy", filterBy);
    params.append("search", search);
    const res = await fetch(`/api/room?${params.toString()}`);
    const data = await res.json();
    setRooms(data);
    setLoading(false);
  };

  // Fetch on mount (initial load)
  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRooms();
  };

  const handleReset = () => {
    setSearch("");
    setFilterBy("building");
    setTimeout(fetchRooms, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DoorOpen className="h-6 w-6 text-[#7a1818]" />
            Rooms
          </h1>
          <p className="text-gray-600">Manage dormitory rooms</p>
        </div>
        <Link href="/room/add" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Room
        </Link>
      </div>

      <form
        className="flex items-center gap-2 mb-8"
        onSubmit={handleSearch}
        autoComplete="off"
      >
        <select
          className="border rounded px-3 py-2 shadow-sm"
          value={filterBy}
          onChange={e => setFilterBy(e.target.value as any)}
        >
          <option value="building">Building</option>
          <option value="room">Room Number</option>
        </select>
        <input
          className="flex-1 border rounded px-3 py-2"
          type="text"
          placeholder={`Search by ${filterBy === "building" ? "Building" : "Room Number"}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          type="submit"
          className="bg-[#7a1818] text-white rounded px-6 py-2 font-medium flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
        <button
          type="button"
          className="text-[#7a1818] underline ml-2"
          onClick={handleReset}
        >
          Reset
        </button>
      </form>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <RoomsList rooms={rooms} />
      )}
    </div>
  );
}
