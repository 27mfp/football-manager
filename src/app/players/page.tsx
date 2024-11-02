"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  TrendingUp,
  Clock,
  Medal,
  UserPlus,
  Edit2,
  User,
  Percent,
  DollarSign,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageTitle } from "@/components/PageTitle";
import { Skeleton } from "@/components/ui/skeleton";

interface Player {
  id: number;
  name: string;
  elo: number;
  matches: number;
  wins: number;
}

interface MatchPlayer {
  player: { id: number; name: string };
  paid: boolean;
  team: string;
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
  players: MatchPlayer[];
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPlayers(), fetchMatches()]);
      setIsLoading(false);
    };
    fetchData();
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

  const calculatePlayerStats = (player: Player) => {
    const playerMatches = matches.filter((match) =>
      match.players.some((p) => p.player.id === player.id)
    );

    const wins = playerMatches.reduce((total, match) => {
      if (!match.result) return total;

      const playerInMatch = match.players.find(
        (p) => p.player.id === player.id
      );
      if (!playerInMatch) return total;

      const playerTeam = playerInMatch.team;
      const [scoreA, scoreB] = match.result.split("-").map(Number);

      // Check if player's team won (no draw)
      const isWinner =
        (playerTeam === "A" && scoreA > scoreB) ||
        (playerTeam === "B" && scoreB > scoreA);

      return isWinner ? total + 1 : total;
    }, 0);

    const totalMatches = playerMatches.length;
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

    return {
      matches: totalMatches,
      wins,
      winRate,
    };
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageTitle title="Players" />
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle title="Players" />
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div>
            <CardTitle className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
              Players
            </CardTitle>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage and view all player statistics
            </p>
          </div>
          <Link href="/players/create">
            <Button className="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white">
              <UserPlus className="mr-2 h-4 w-4" />
              Create New Player
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-100 dark:bg-zinc-800/50">
                <TableRow className="hover:bg-zinc-100/50 dark:hover:bg-zinc-800/75">
                  <TableHead className="text-center font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <User className="h-4 w-4" />
                      Name
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Elo
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4" />
                      Matches
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Wins
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Percent className="h-4 w-4" />
                      Win Rate
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Missing Payments
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayers.map((player) => {
                  const stats = calculatePlayerStats(player);
                  const missingPayments = calculateMissingPayments(player.id);

                  return (
                    <TableRow
                      key={player.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <TableCell className="text-center font-medium">
                        <Link
                          href={`/players/${player.id}`}
                          className="hover:underline text-zinc-800 dark:text-white"
                        >
                          {player.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {player.elo.toFixed(0)}
                      </TableCell>
                      <TableCell className="text-center">
                        {stats.matches}
                      </TableCell>
                      <TableCell className="text-center">
                        {stats.wins}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            stats.winRate >= 60
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : stats.winRate >= 40
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {stats.winRate > 0
                            ? `${stats.winRate.toFixed(1)}%`
                            : "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            missingPayments > 0
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          }`}
                        >
                          ${Math.abs(missingPayments).toFixed(2)}
                          {missingPayments <= 0 && " paid"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Link href={`/players/${player.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                              <User className="h-4 w-4" />
                              <span className="sr-only">Profile</span>
                            </Button>
                          </Link>
                          <Link href={`/players/${player.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                              <Edit2 className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
