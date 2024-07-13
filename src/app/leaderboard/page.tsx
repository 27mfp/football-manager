"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Player {
  id: number;
  name: string;
  elo: number;
  matches: number;
  wins: number;
}

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const res = await fetch("/api/players");
      if (!res.ok) throw new Error("Failed to fetch players");
      const data = await res.json();
      // Sort players by Elo rating in descending order
      setPlayers(data.sort((a: Player, b: Player) => b.elo - a.elo));
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-zinc-800 dark:text-white mb-6">
        Leaderboard
      </h1>
      <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead className="bg-zinc-50 dark:bg-zinc-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider"
              >
                Rank
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider"
              >
                Elo
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider"
              >
                Matches
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider"
              >
                Wins
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider"
              >
                Win Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
            {players.map((player, index) => (
              <tr
                key={player.id}
                className="hover:bg-zinc-100 dark:hover:bg-zinc-700 transition duration-150 text-center"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white ">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white text-center">
                  {player.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-300 text-center">
                  {player.elo.toFixed(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-300 text-center">
                  {player.matches}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-300 text-center">
                  {player.wins}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-300 text-center">
                  {player.matches > 0
                    ? ((player.wins / player.matches) * 100).toFixed(1) + "%"
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
