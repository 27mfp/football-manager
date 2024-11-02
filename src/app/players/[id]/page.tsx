"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PageTitle } from "@/components/PageTitle";

interface EloHistory {
  date: string;
  elo: number;
  matchId: number;
  change: number;
}

interface Player {
  id: number;
  name: string;
  elo: number;
  matches: number;
  wins: number;
  eloHistory: EloHistory[];
}

interface MatchPlayer {
  player: { id: number; name: string };
  paid: boolean;
  eloBefore: number;
  eloAfter: number;
  team: string; // Added team field
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

export default function PlayerProfile({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [eloHistory, setEloHistory] = useState<EloHistory[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlayerData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch player data
      const playerRes = await fetch(`/api/players/${params.id}`);
      const playerData = await playerRes.json();

      // Fetch all matches this player participated in
      const matchesRes = await fetch(`/api/matches`);
      const allMatches = await matchesRes.json();

      // Filter matches for this player and sort by date (newest first)
      const playerMatches = allMatches
        .filter((match: Match) =>
          match.players.some(
            (p: MatchPlayer) => p.player.id === Number(params.id)
          )
        )
        .sort(
          (a: Match, b: Match) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      // Calculate wins
      const wins = playerMatches.reduce((total: number, match: Match) => {
        if (!match.result) return total;

        // Find player's team in this match
        const playerInMatch = match.players.find(
          (p: MatchPlayer) => p.player.id === Number(params.id)
        );
        if (!playerInMatch) return total;

        const playerTeam = playerInMatch.team;
        const [scoreA, scoreB] = match.result.split("-").map(Number);

        // Determine if player's team won
        const isWinner =
          (playerTeam === "A" && scoreA > scoreB) ||
          (playerTeam === "B" && scoreB > scoreA);

        return isWinner ? total + 1 : total;
      }, 0);

      // Build ELO history
      const history = playerMatches
        .map((match: Match) => {
          const playerMatch = match.players.find(
            (p: MatchPlayer) => p.player.id === Number(params.id)
          );
          return {
            date: new Date(match.date).toLocaleDateString(),
            elo: playerMatch!.eloAfter || playerMatch!.eloBefore,
            matchId: match.id,
            change: playerMatch!.eloAfter
              ? playerMatch!.eloAfter - playerMatch!.eloBefore
              : 0,
          };
        })
        .sort(
          (a: EloHistory, b: EloHistory) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      // Update player data
      const updatedPlayerData = {
        ...playerData,
        matches: playerMatches.length,
        wins: wins,
        winRate:
          playerMatches.length > 0 ? (wins / playerMatches.length) * 100 : 0,
      };

      setPlayer(updatedPlayerData);
      setEloHistory(history);
      setMatches(playerMatches);
    } catch (error) {
      console.error("Error fetching player data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchPlayerData();
  }, [fetchPlayerData]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Player not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle title={player.name} />
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6 flex justify-between items-center">
          <Link href="/players">
            <Button
              variant="ghost"
              className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Players
            </Button>
          </Link>
          <Link href={`/players/${player.id}/edit`}>
            <Button variant="outline">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-200 mb-8">
          {player.name}
        </h1>

        <div className="grid gap-6">
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Player Statistics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-zinc-500">Current ELO</p>
                <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                  {player.elo.toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Matches</p>
                <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                  {matches.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Wins</p>
                <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                  {player.wins}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Win Rate</p>
                <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                  {((player.wins / matches.length) * 100).toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ELO History Chart */}
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>ELO History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={eloHistory}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-zinc-200 dark:stroke-zinc-700"
                    />
                    <XAxis
                      dataKey="date"
                      className="text-zinc-600 dark:text-zinc-400"
                    />
                    <YAxis
                      className="text-zinc-600 dark:text-zinc-400"
                      domain={["dataMin - 100", "dataMax + 100"]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgb(24 24 27)",
                        borderColor: "rgb(63 63 70)",
                        borderRadius: "0.5rem",
                      }}
                      labelStyle={{ color: "rgb(244 244 245)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="elo"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{
                        fill: "#2563eb",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 6,
                        fill: "#2563eb",
                        stroke: "#1d4ed8",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Match History */}
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Match History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="bg-zinc-100 dark:bg-zinc-800/50">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>ELO Change</TableHead>
                    <TableHead>Payment Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => {
                    const playerMatch = match.players.find(
                      (p) => p.player.id === Number(params.id)
                    );
                    const eloChange = playerMatch?.eloAfter
                      ? playerMatch.eloAfter - playerMatch.eloBefore
                      : 0;

                    return (
                      <TableRow key={match.id}>
                        <TableCell>
                          {new Date(match.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{match.location}</TableCell>
                        <TableCell>{match.result || "Not recorded"}</TableCell>
                        <TableCell>
                          <span
                            className={`${
                              eloChange > 0
                                ? "text-green-500"
                                : eloChange < 0
                                ? "text-red-500"
                                : ""
                            }`}
                          >
                            {eloChange > 0 ? "+" : ""}
                            {eloChange}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`${
                              playerMatch?.paid
                                ? "text-green-500 dark:text-green-400"
                                : "text-red-500 dark:text-red-400"
                            }`}
                          >
                            {playerMatch?.paid ? "Paid" : "Unpaid"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
