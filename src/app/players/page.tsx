"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Player {
  id: number;
  name: string;
  elo: number;
  matches: number;
  wins: number;
  matchesPlayed: number;
  amountToPay: number;
}

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(data);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Players</h2>
      <Link
        href="/players/create"
        className="bg-[var(--primary)] text-white px-4 py-2 rounded inline-block mb-4"
      >
        Create New Player
      </Link>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => (
          <div
            key={player.id}
            className="bg-[var(--card-bg)] p-4 rounded shadow"
          >
            <h3 className="text-xl font-bold">{player.name}</h3>
            <p>Elo Rating: {player.elo.toFixed(0)}</p>
            <p>Matches played: {player.matchesPlayed}</p>
            <p>Wins: {player.wins}</p>
            <p>
              Win Rate:{" "}
              {((player.wins / player.matchesPlayed) * 100).toFixed(1)}%
            </p>
            <p className="font-semibold text-[var(--primary)]">
              Amount to pay: ${player.amountToPay.toFixed(2)}
            </p>
            <Link
              href={`/players/${player.id}`}
              className="text-[var(--primary)] mt-2 inline-block"
            >
              Edit Player
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
