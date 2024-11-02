"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy, MapPin, Users, Star, Crown, Activity } from "lucide-react";
import { PageTitle } from "@/components/PageTitle";

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
  location: string;
  result: string | null;
  players: Array<{
    player: Player;
    team: string;
  }>;
}

interface LocationStat {
  location: string;
  count: number;
}

interface Stats {
  totalMatches: number;
  totalPlayers: number;
  mostFrequentLocation: LocationStat;
  topPlayer: {
    mostGames: { player: Player; games: number };
    mostWins: { player: Player; wins: number };
    bestWinRate: { player: Player; rate: number };
    highestElo: { player: Player; elo: number };
  };
  recentMatches: Match[];
}

interface LocationCount {
  [key: string]: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch players and matches
      const [playersRes, matchesRes] = await Promise.all([
        fetch("/api/players"),
        fetch("/api/matches"),
      ]);

      const players: Player[] = await playersRes.json();
      const matches: Match[] = await matchesRes.json();

      // Calculate location statistics
      const locationCounts = matches.reduce(
        (acc: LocationCount, match: Match) => {
          acc[match.location] = (acc[match.location] || 0) + 1;
          return acc;
        },
        {}
      );

      const mostFrequentLocation: LocationStat = Object.entries(locationCounts)
        .map(([location, count]: [string, number]) => ({ location, count }))
        .sort((a: LocationStat, b: LocationStat) => b.count - a.count)[0] || {
        location: "N/A",
        count: 0,
      };

      // Calculate win rates and find player with best rate
      const playerWithStats = players
        .map((player: Player) => ({
          player,
          winRate:
            player.matches > 0 ? (player.wins / player.matches) * 100 : 0,
        }))
        .sort((a, b) => b.winRate - a.winRate);

      const bestWinRate = playerWithStats[0] || {
        player: players[0],
        winRate: 0,
      };

      // Find players with most games, wins, and highest ELO
      const mostGames = players.reduce(
        (max: Player, p: Player) => (p.matches > (max?.matches || 0) ? p : max),
        players[0]
      );
      const mostWins = players.reduce(
        (max: Player, p: Player) => (p.wins > (max?.wins || 0) ? p : max),
        players[0]
      );
      const highestElo = players.reduce(
        (max: Player, p: Player) => (p.elo > (max?.elo || 0) ? p : max),
        players[0]
      );

      const statsData: Stats = {
        totalMatches: matches.length,
        totalPlayers: players.length,
        mostFrequentLocation,
        topPlayer: {
          mostGames: {
            player: mostGames,
            games: mostGames?.matches || 0,
          },
          mostWins: {
            player: mostWins,
            wins: mostWins?.wins || 0,
          },
          bestWinRate: {
            player: bestWinRate.player,
            rate: bestWinRate.winRate,
          },
          highestElo: {
            player: highestElo,
            elo: highestElo?.elo || 0,
          },
        },
        recentMatches: matches.slice(0, 5),
      };

      setStats(statsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return <div>Loading statistics...</div>;
  }

  if (!stats) {
    return <div>No statistics available.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle title="Statistics" />
      <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-200 mb-8">
        Statistics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Overview Stats */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-zinc-800 dark:text-zinc-200">
              Overview
            </CardTitle>
            <Activity className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-zinc-500">Total Matches</span>
              <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                {stats.totalMatches}
              </p>
            </div>
            <div>
              <span className="text-sm text-zinc-500">Total Players</span>
              <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                {stats.totalPlayers}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Popular Location */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-zinc-800 dark:text-zinc-200">
              Most Played Location
            </CardTitle>
            <MapPin className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
              {stats.mostFrequentLocation.location}
            </p>
            <p className="text-sm text-zinc-500">
              {stats.mostFrequentLocation.count} matches
            </p>
          </CardContent>
        </Card>

        {/* Top Players */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-zinc-800 dark:text-zinc-200">
              Top Players
            </CardTitle>
            <Trophy className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-zinc-500">Most Games</span>
              <p className="text-zinc-800 dark:text-zinc-200">
                {stats.topPlayer.mostGames.player.name} (
                {stats.topPlayer.mostGames.games})
              </p>
            </div>
            <div>
              <span className="text-sm text-zinc-500">Most Wins</span>
              <p className="text-zinc-800 dark:text-zinc-200">
                {stats.topPlayer.mostWins.player.name} (
                {stats.topPlayer.mostWins.wins})
              </p>
            </div>
            <div>
              <span className="text-sm text-zinc-500">Best Win Rate</span>
              <p className="text-zinc-800 dark:text-zinc-200">
                {stats.topPlayer.bestWinRate.player.name} (
                {stats.topPlayer.bestWinRate.rate
                  ? `${stats.topPlayer.bestWinRate.rate.toFixed(1)}%`
                  : "N/A"}
                )
              </p>
            </div>
            <div>
              <span className="text-sm text-zinc-500">Highest ELO</span>
              <p className="text-zinc-800 dark:text-zinc-200">
                {stats.topPlayer.highestElo.player.name} (
                {stats.topPlayer.highestElo.elo})
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
