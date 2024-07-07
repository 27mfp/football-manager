"use client";

import { useState, useEffect } from "react";

interface Player {
  id: number;
  name: string;
  elo: number;
  matchesPlayed: number;
}

export default function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(data.sort((a: Player, b: Player) => b.elo - a.elo));
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Leaderboard</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--card-bg)]">
              <th className="p-2">Rank</th>
              <th className="p-2">Name</th>
              <th className="p-2">Elo</th>
              <th className="p-2">Matches Played</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr
                key={player.id}
                className={
                  index % 2 === 0
                    ? "bg-[var(--background)]"
                    : "bg-[var(--card-bg)]"
                }
              >
                <td className="p-2 text-center">{index + 1}</td>
                <td className="p-2 text-center">{player.name}</td>
                <td className="p-2 text-center">{player.elo}</td>
                <td className="p-2 text-center">{player.matchesPlayed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
