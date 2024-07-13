"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TeamSelector from "@/components/TeamSelector";

interface Player {
  id: number;
  name: string;
  elo: number;
}

export default function CreateMatch() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamA, setTeamA] = useState<number[]>([]);
  const [teamB, setTeamB] = useState<number[]>([]);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(data);
  };

  const handleTeamsChange = (newTeamA: number[], newTeamB: number[]) => {
    setTeamA(newTeamA);
    setTeamB(newTeamB);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/matches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date,
        time,
        price: parseFloat(price),
        location,
        teamA,
        teamB,
      }),
    });

    if (response.ok) {
      router.push("/matches");
      router.refresh();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="container mx-auto mt-8 px-4 space-y-4"
    >
      <h2 className="text-3xl font-bold mb-4">Create New Match</h2>
      <div>
        <label htmlFor="date" className="block mb-2">
          Date:
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full p-2 rounded bg-zinc-100 text-black dark:bg-zinc-700 dark:text-white"
        />
      </div>
      <div>
        <label htmlFor="time" className="block mb-2">
          Time:
        </label>
        <input
          type="time"
          id="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          className="w-full p-2 rounded bg-zinc-100 text-black dark:bg-zinc-700 dark:text-white"
        />
      </div>
      <div>
        <label htmlFor="price" className="block mb-2">
          Price:
        </label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="w-full p-2 rounded bg-zinc-100 text-black dark:bg-zinc-700 dark:text-white"
        />
      </div>
      <div>
        <label htmlFor="location" className="block mb-2">
          Location:
        </label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          className="w-full p-2 rounded bg-zinc-100 text-black dark:bg-zinc-700 dark:text-white"
        />
      </div>
      <TeamSelector
        players={players}
        teamA={teamA}
        teamB={teamB}
        onTeamsChange={handleTeamsChange}
      />
      <button
        type="submit"
        className="bg-zinc-100 text-black dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-800 px-4 py-2 rounded"
      >
        Create Match
      </button>
    </form>
  );
}
