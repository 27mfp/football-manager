"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Player {
  id: number;
  name: string;
}

export default function PlayerDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    fetchPlayer();
  }, []);

  const fetchPlayer = async () => {
    const res = await fetch(`/api/players/${params.id}`);
    const data = await res.json();
    setPlayer(data);
    setName(data.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/players/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const updatedPlayer = await res.json();
      setPlayer(updatedPlayer);
      router.refresh();
    }
  };

  if (!player) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Player Details</h2>
      <div className="bg-white p-6 rounded shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-2">
              Name:
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Update Player
          </button>
        </form>
      </div>
    </div>
  );
}
