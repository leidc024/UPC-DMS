"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react";

type Resident = {
  student_number: string;
  lname: string;
  fname: string;
  course: string;
  year_level: string;
  email: string;
};

export default function ResidentsList() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState<"student_number" | "name">("student_number");

  const fetchResidents = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) {
      params.set("search", search);
      params.set("filterBy", filterBy);
    }
    const res = await fetch(`/api/residents?${params.toString()}`);
    setResidents(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchResidents();
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResidents();
  };

  const handleReset = () => {
    setSearch("");
    fetchResidents();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
        <select
          className="border rounded p-2"
          value={filterBy}
          onChange={e => setFilterBy(e.target.value as "student_number" | "name")}
        >
          <option value="student_number">Student Number</option>
          <option value="name">Name</option>
        </select>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={`Search by ${filterBy === "student_number" ? "Student Number" : "Name"}...`}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a1818]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary px-4 py-2">Search</button>
        <button type="button" onClick={handleReset} className="btn-secondary px-4 py-2">Reset</button>
      </form>

      {/* Table */}
      {loading ? (
        <div>Loading...</div>
      ) : residents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No residents found</p>
          <Link href="/residents/add" className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Resident
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Student Number</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Course</th>
                <th className="px-4 py-2 text-left">Year Level</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((resident) => (
                <tr key={resident.student_number} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{resident.student_number}</td>
                  <td className="px-4 py-3">
                    {resident.lname}, {resident.fname}
                  </td>
                  <td className="px-4 py-3">{resident.course}</td>
                  <td className="px-4 py-3">{resident.year_level}</td>
                  <td className="px-4 py-3">{resident.email}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/residents/${resident.student_number}`}
                      className="text-[#7a1818] hover:underline mr-3"
                    >
                      View
                    </Link>
                    <Link
                      href={`/residents/edit/${resident.student_number}`}
                      className="text-[#7a1818] hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
