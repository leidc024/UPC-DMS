// /app/residents/RoomsList.tsx

type Room = {
  room_id: number;
  room_number: string;
  building_name: string;
  capacity: number;
  current_occupants: number;
};

export default function RoomsList({ rooms }: { rooms: Room[] }) {
  if (!rooms || rooms.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No rooms found matching your search.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded shadow border">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2">Room Number</th>
            <th className="px-4 py-2">Building</th>
            <th className="px-4 py-2">Capacity</th>
            <th className="px-4 py-2">Occupants</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map(room => (
            <tr key={room.room_id} className="hover:bg-gray-50">
              <td className="px-4 py-2">{room.room_number}</td>
              <td className="px-4 py-2">{room.building_name}</td>
              <td className="px-4 py-2">{room.capacity}</td>
              <td className="px-4 py-2">{room.current_occupants}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
