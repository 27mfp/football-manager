"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Medal, Award, Star, Users2, Percent } from "lucide-react";
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
  players: MatchPlayer[];
}

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [playersRes, matchesRes] = await Promise.all([
        fetch("/api/players"),
        fetch("/api/matches"),
      ]);

      if (!playersRes.ok || !matchesRes.ok)
        throw new Error("Failed to fetch data");

      const playersData: Player[] = await playersRes.json();
      const matchesData: Match[] = await matchesRes.json();

      setMatches(matchesData);
      // Sort players by ELO after calculating real stats
      const playersWithStats = playersData.map((player) => ({
        ...player,
        ...calculatePlayerStats(player.id, matchesData),
      }));

      setPlayers(playersWithStats.sort((a, b) => b.elo - a.elo));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculatePlayerStats = (playerId: number, matchesData: Match[]) => {
    const playerMatches = matchesData.filter((match) =>
      match.players.some((p) => p.player.id === playerId)
    );

    const wins = playerMatches.reduce((total, match) => {
      if (!match.result) return total;

      const playerInMatch = match.players.find((p) => p.player.id === playerId);
      if (!playerInMatch) return total;

      const playerTeam = playerInMatch.team;
      const [scoreA, scoreB] = match.result.split("-").map(Number);

      // Only count as win if player's team scored more
      const isWinner =
        (playerTeam === "A" && scoreA > scoreB) ||
        (playerTeam === "B" && scoreB > scoreA);

      return isWinner ? total + 1 : total;
    }, 0);

    return {
      matches: playerMatches.length,
      wins,
    };
  };

  const getRankDisplay = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="flex items-center justify-center">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span className="ml-2 font-bold text-yellow-500">1st</span>
          </div>
        );
      case 1:
        return (
          <div className="flex items-center justify-center">
            <Medal className="h-6 w-6 text-gray-400" />
            <span className="ml-2 font-bold text-gray-400">2nd</span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center">
            <Medal className="h-6 w-6 text-amber-700" />
            <span className="ml-2 font-bold text-amber-700">3rd</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center">
            <span className="text-zinc-600 dark:text-zinc-400 font-medium text-lg">
              {index + 1}
            </span>
          </div>
        );
    }
  };

  const getWinRateBadge = (wins: number, matches: number) => {
    if (matches === 0) return null;
    const winRate = (wins / matches) * 100;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${
          winRate >= 60
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : winRate >= 40
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        }`}
      >
        {winRate.toFixed(1)}%
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageTitle title="Leaderboard" />
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-6">
            <Skeleton className="h-8 w-48" />
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
      <PageTitle title="Leaderboard" />
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <Trophy className="h-7 w-7 text-yellow-500" />
                <CardTitle className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                  Leaderboard Rankings
                </CardTitle>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Player rankings based on ELO rating system
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-100 dark:bg-zinc-800/50">
                <TableRow>
                  <TableHead className="text-center w-24 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Award className="h-4 w-4" />
                      Rank
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Users2 className="h-4 w-4" />
                      Player
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Star className="h-4 w-4" />
                      Elo Rating
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    Matches
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    Wins
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Percent className="h-4 w-4" />
                      Win Rate
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player, index) => (
                  <TableRow
                    key={player.id}
                    className={`
                      transition-colors
                      ${index < 3 ? "bg-zinc-50/50 dark:bg-zinc-800/30" : ""}
                      ${
                        index === 0
                          ? "hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20"
                          : index === 1
                          ? "hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                          : index === 2
                          ? "hover:bg-amber-50/50 dark:hover:bg-amber-900/20"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      }
                    `}
                  >
                    <TableCell className="text-center py-4">
                      {getRankDisplay(index)}
                    </TableCell>
                    <TableCell className="text-center font-medium text-lg">
                      {player.name}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {player.elo.toFixed(0)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {player.matches}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {player.wins}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {player.matches > 0 ? (
                        getWinRateBadge(player.wins, player.matches)
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-500">
                          N/A
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
