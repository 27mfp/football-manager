"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Player {
  id: number;
  name: string;
}

interface PlayerMatchResult {
  player: Player;
  team: string;
  paid: boolean;
  eloBefore: number;
  eloAfter: number;
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
  players: PlayerMatchResult[];
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchMatches();
  }, []);

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

  const deleteMatch = async (id: number) => {
    if (
      confirm(
        "Are you sure you want to delete this match? This will revert ELO changes for all players involved."
      )
    ) {
      try {
        const res = await fetch(`/api/matches/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete match");
        fetchMatches(); // Refresh the matches list
      } catch (error) {
        console.error("Error deleting match:", error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-zinc-800 dark:text-white">
          Matches
        </h1>
        <Link
          href="/matches/create"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Create New Match
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-white dark:bg-zinc-800 shadow-md rounded-lg overflow-hidden flex flex-col h-full"
          >
            <div className="p-4 flex-grow">
              <p className="text-lg font-semibold text-zinc-800 dark:text-white">
                {new Date(match.date).toLocaleDateString()} at {match.time}
              </p>
              <p className="text-zinc-600 dark:text-zinc-300">
                {match.location}
              </p>
              <p className="text-zinc-600 dark:text-zinc-300">
                Result: {match.result || "Not played yet"}
              </p>
              <p className="text-zinc-600 dark:text-zinc-300">
                Total Price: ${match.price.toFixed(2)}
              </p>
              <p className="text-zinc-600 dark:text-zinc-300">
                Price per player: ${match.pricePerPlayer.toFixed(2)}
              </p>
              <p className="text-zinc-600 dark:text-zinc-300">
                Total Paid: ${match.totalPaid.toFixed(2)}
              </p>
              <p className="text-zinc-600 dark:text-zinc-300">
                Total to Pay: ${match.totalToPay.toFixed(2)}
              </p>
              <div className="mt-4">
                <p className="font-semibold text-zinc-700 dark:text-zinc-200">
                  Team A:
                </p>
                <ul className="list-disc list-inside">
                  {match.players
                    .filter((p) => p.team === "A")
                    .map((p, index) => (
                      <li
                        key={index}
                        className="text-zinc-600 dark:text-zinc-300"
                      >
                        {p.player.name}
                        <span
                          className={
                            p.paid ? "text-green-500 ml-2" : "text-red-500 ml-2"
                          }
                        >
                          {p.paid ? "(Paid)" : "(Unpaid)"}
                        </span>
                        {match.result && (
                          <span className="ml-2">
                            ELO: {Math.round(p.eloBefore)} →{" "}
                            <span
                              className={
                                (p.eloAfter ?? 0) > (p.eloBefore ?? 0)
                                  ? "text-green-500"
                                  : "text-red-500"
                              }
                            >
                              {Math.round(p.eloAfter)} (
                              {p.eloBefore !== undefined &&
                              p.eloAfter !== undefined
                                ? (p.eloAfter > p.eloBefore ? "+" : "-") +
                                  Math.abs(Math.round(p.eloAfter - p.eloBefore))
                                : "N/A"}
                              )
                            </span>
                          </span>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
              <div className="mt-2">
                <p className="font-semibold text-zinc-700 dark:text-zinc-200">
                  Team B:
                </p>
                <ul className="list-disc list-inside">
                  {match.players
                    .filter((p) => p.team === "B")
                    .map((p, index) => (
                      <li
                        key={index}
                        className="text-zinc-600 dark:text-zinc-300"
                      >
                        {p.player.name}
                        <span
                          className={
                            p.paid ? "text-green-500 ml-2" : "text-red-500 ml-2"
                          }
                        >
                          {p.paid ? "(Paid)" : "(Unpaid)"}
                        </span>
                        {match.result && (
                          <span className="ml-2">
                            ELO: {p.eloBefore} →{" "}
                            <span
                              className={
                                p.eloAfter > p.eloBefore
                                  ? "text-green-500"
                                  : "text-red-500"
                              }
                            >
                              {p.eloAfter} (
                              {p.eloAfter - p.eloBefore > 0 ? "+" : ""}
                              {p.eloAfter - p.eloBefore})
                            </span>
                          </span>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-700 px-4 py-3 text-right mt-auto">
              <Link
                href={`/matches/${match.id}/edit`}
                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
              >
                Edit
              </Link>
              <Link
                href={`/matches/${match.id}/payments`}
                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-4"
              >
                Manage Payments
              </Link>
              <button
                onClick={() => deleteMatch(match.id)}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
