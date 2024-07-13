"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Player {
  id: number;
  name: string;
  elo: number;
  matches: number;
  wins: number;
}

interface Match {
  id: number;
  date: string;
  time: string;
  location: string;
  result: string | null;
  price: number;
  pricePerPlayer: number;
  totalPaid: number;
  totalToPay: number;
  players: Array<{
    player: { id: number; name: string };
    paid: boolean;
  }>;
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchPlayers();
    fetchMatches();
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

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/matches");
      if (!res.ok) throw new Error("Failed to fetch matches");
      const data = await res.json();
      setMatches(data);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => a.name.localeCompare(b.name));
  }, [players]);

  const calculateMissingPayments = (playerId: number) => {
    let totalOwed = 0;
    let totalPaid = 0;

    matches.forEach((match) => {
      const playerInMatch = match.players?.find(
        (p) => p.player.id === playerId
      );
      if (playerInMatch) {
        totalOwed += match.pricePerPlayer;
        if (playerInMatch.paid) {
          totalPaid += match.pricePerPlayer;
        }
      }
    });

    return totalOwed - totalPaid;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-zinc-800 dark:text-white">
          Players
        </h1>
        <Link
          href="/players/create"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Create New Player
        </Link>
      </div>
      <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-zinc-300 dark:divide-zinc-500">
          <thead className="bg-zinc-200 dark:bg-zinc-700">
            <tr>
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
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider"
              >
                Missing Payments
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
            {sortedPlayers.map((player) => (
              <tr
                key={player.id}
                className="hover:bg-zinc-100 dark:hover:bg-zinc-700 transition duration-150"
              >
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-300 text-center">
                  ${calculateMissingPayments(player.id).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                  <Link
                    href={`/players/${player.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-center"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
