"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Player {
  id: number;
  name: string;
  elo: number;
}

export default function EditPlayer({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [name, setName] = useState("");
  const [elo, setElo] = useState("");

  useEffect(() => {
    fetchPlayer();
  }, []);

  const fetchPlayer = async () => {
    const res = await fetch(`/api/players/${params.id}`);
    const data = await res.json();
    setPlayer(data);
    setName(data.name);
    setElo(data.elo.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`/api/players/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, elo: parseFloat(elo) }),
    });

    if (response.ok) {
      router.push("/players");
      router.refresh();
    }
  };

  if (!player) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-3xl font-bold mb-4">Edit Player</h2>
      <div>
        <label htmlFor="name" className="block mb-2">
          Name:
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-2 rounded bg-[var(--card-bg)] text-[var(--text)]"
        />
      </div>
      <div>
        <label htmlFor="elo" className="block mb-2">
          Elo Rating:
        </label>
        <input
          type="number"
          id="elo"
          value={elo}
          onChange={(e) => setElo(e.target.value)}
          required
          className="w-full p-2 rounded bg-[var(--card-bg)] text-[var(--text)]"
        />
      </div>
      <button
        type="submit"
        className="bg-[var(--primary)] text-white px-4 py-2 rounded"
      >
        Update Player
      </button>
    </form>
  );
}
