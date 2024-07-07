"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Player {
  id: number;
  name: string;
  elo: number;
  matches: number;
  wins: number;
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const res = await fetch("/api/players");
      if (!res.ok) throw new Error("Failed to fetch players");
      const data = await res.json();
      setPlayers(data);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  return (
    <div>
      <h1>Players</h1>
      <Link href="/players/create">Create New Player</Link>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            {player.name} - Elo: {player.elo} - Matches: {player.matches} -
            Wins: {player.wins}
            <Link href={`/players/${player.id}/edit`}>Edit</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
