"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Edit,
  Wallet,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { PageTitle } from "@/components/PageTitle";

interface Player {
  id: number;
  name: string;
  elo: number;
}

interface PlayerMatchResult {
  id: number;
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
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);
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
        fetchMatches();
      } catch (error) {
        console.error("Error deleting match:", error);
      }
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedMatch(expandedMatch === id ? null : id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle title="Matches" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-200">
          Matches
        </h1>
        <Link href="/matches/create">
          <Button className="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Match
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {matches.map((match) => (
          <Card
            key={match.id}
            className="border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700"
          >
            <CardHeader
              className="cursor-pointer"
              onClick={() => toggleExpand(match.id)}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
                    {new Date(match.date).toLocaleDateString()} at {match.time}
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {match.location}
                  </p>
                </div>
                {expandedMatch === match.id ? (
                  <ChevronUp className="h-5 w-5 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-zinc-400" />
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Result
                  </p>
                  <p className="text-zinc-800 dark:text-zinc-200">
                    {match.result || "Pending"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Price/Player
                  </p>
                  <p className="text-zinc-800 dark:text-zinc-200">
                    €{match.pricePerPlayer.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Total Paid
                  </p>
                  <p className="text-green-600 dark:text-green-400">
                    €{match.totalPaid.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Status
                  </p>
                  <p
                    className={`${
                      Math.abs(match.totalToPay) < 0.01
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {Math.abs(match.totalToPay) < 0.01
                      ? "Paid"
                      : `€${match.totalToPay.toFixed(2)} Due`}
                  </p>
                </div>
              </div>
            </CardHeader>

            {expandedMatch === match.id && (
              <CardContent className="border-t border-zinc-200 dark:border-zinc-800">
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  {/* Team A */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Team A
                    </h3>
                    <ul className="space-y-2">
                      {match.players
                        .filter((p) => p.team === "A")
                        .sort(
                          (a, b) => (a.player?.id || 0) - (b.player?.id || 0)
                        ) // Sort by player ID to maintain order
                        .map((p) => (
                          <li
                            key={p.player.id}
                            className="flex items-center justify-between p-2 rounded-md bg-zinc-50 dark:bg-zinc-800/50"
                          >
                            <span className="text-zinc-700 dark:text-zinc-300">
                              {p.player?.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  p.paid
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                              >
                                {p.paid ? "Paid" : "Unpaid"}
                              </span>
                              {/* Show current ELO when no result */}
                              {!match.result && p.player?.elo && (
                                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                  ELO: {Math.round(p.player.elo)}
                                </span>
                              )}
                              {/* Show ELO changes when there is a result */}
                              {match.result &&
                                p.eloBefore != null &&
                                p.eloAfter != null && (
                                  <span className="text-sm">
                                    {Math.round(p.eloBefore)} →{" "}
                                    <span
                                      className={
                                        p.eloAfter > p.eloBefore
                                          ? "text-green-600 dark:text-green-400"
                                          : "text-red-600 dark:text-red-400"
                                      }
                                    >
                                      {Math.round(p.eloAfter)}
                                    </span>
                                  </span>
                                )}
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Team B
                    </h3>
                    <ul className="space-y-2">
                      {match.players
                        .filter((p) => p.team === "B")
                        .sort(
                          (a, b) => (a.player?.id || 0) - (b.player?.id || 0)
                        ) // Sort by player ID to maintain order
                        .map((p) => (
                          <li
                            key={p.player.id}
                            className="flex items-center justify-between p-2 rounded-md bg-zinc-50 dark:bg-zinc-800/50"
                          >
                            <span className="text-zinc-700 dark:text-zinc-300">
                              {p.player?.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  p.paid
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                              >
                                {p.paid ? "Paid" : "Unpaid"}
                              </span>
                              {/* Show current ELO when no result */}
                              {!match.result && p.player?.elo && (
                                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                  ELO: {Math.round(p.player.elo)}
                                </span>
                              )}
                              {/* Show ELO changes when there is a result */}
                              {match.result &&
                                p.eloBefore != null &&
                                p.eloAfter != null && (
                                  <span className="text-sm">
                                    {Math.round(p.eloBefore)} →{" "}
                                    <span
                                      className={
                                        p.eloAfter > p.eloBefore
                                          ? "text-green-600 dark:text-green-400"
                                          : "text-red-600 dark:text-red-400"
                                      }
                                    >
                                      {Math.round(p.eloAfter)}
                                    </span>
                                  </span>
                                )}
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            )}

            <CardFooter className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4">
              <Link
                href={`/matches/${match.id}/edit`}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Link
                href={`/matches/${match.id}/payments`}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Payments
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteMatch(match.id)}
                className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
