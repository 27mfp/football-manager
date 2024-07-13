"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Player {
  id: number;
  name: string;
  elo: number;
  matches: number;
  wins: number;
}

export default function EditPlayerPage({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPlayer();
  }, []);

  const fetchPlayer = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/players/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch player");
      const data = await res.json();
      setPlayer(data);
    } catch (error) {
      console.error("Error fetching player:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!player) return;

    try {
      const res = await fetch(`/api/players/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(player),
      });
      if (!res.ok) throw new Error("Failed to update player");
      router.push("/players");
      router.refresh();
    } catch (error) {
      console.error("Error updating player:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPlayer((prev) =>
      prev ? { ...prev, [name]: name === "name" ? value : Number(value) } : null
    );
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!player) {
    return <div className="container mx-auto px-4 py-8">Player not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-zinc-800 dark:text-white mb-6">
        Edit Player
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-800 shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label
            className="block text-zinc-700 dark:text-zinc-300 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={player.name}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-zinc-700 dark:text-zinc-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-zinc-700 dark:border-zinc-600"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-zinc-700 dark:text-zinc-300 text-sm font-bold mb-2"
            htmlFor="elo"
          >
            Elo:
          </label>
          <input
            type="number"
            id="elo"
            name="elo"
            value={player.elo}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-zinc-700 dark:text-zinc-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-zinc-700 dark:border-zinc-600"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-zinc-700 dark:text-zinc-300 text-sm font-bold mb-2"
            htmlFor="matches"
          >
            Matches:
          </label>
          <input
            type="number"
            id="matches"
            name="matches"
            value={player.matches}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-zinc-700 dark:text-zinc-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-zinc-700 dark:border-zinc-600"
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-zinc-700 dark:text-zinc-300 text-sm font-bold mb-2"
            htmlFor="wins"
          >
            Wins:
          </label>
          <input
            type="number"
            id="wins"
            name="wins"
            value={player.wins}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-zinc-700 dark:text-zinc-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-zinc-700 dark:border-zinc-600"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Update Player
          </button>
        </div>
      </form>
    </div>
  );
}
