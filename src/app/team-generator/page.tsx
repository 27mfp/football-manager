"use client";

import { useState, useEffect } from "react";
import { User, ArrowRightLeft, X, Users, Shuffle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { PageTitle } from "@/components/PageTitle";

interface Player {
  id: number;
  name: string;
  elo: number;
}

export default function TeamGenerator() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [teamA, setTeamA] = useState<Player[]>([]);
  const [teamB, setTeamB] = useState<Player[]>([]);
  const [teamAAvg, setTeamAAvg] = useState<number>(0);
  const [teamBAvg, setTeamBAvg] = useState<number>(0);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    const sortedPlayers = data.sort((a: Player, b: Player) =>
      a.name.localeCompare(b.name)
    );
    setPlayers(sortedPlayers);
  };

  const handlePlayerToggle = (playerId: number) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const generateTeams = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const selected = players.filter((player) =>
      selectedPlayers.includes(player.id)
    );
    const [balancedTeamA, balancedTeamB] = balanceTeams(selected);
    setTeamA(balancedTeamA);
    setTeamB(balancedTeamB);
    updateAverages(balancedTeamA, balancedTeamB);
  };

  const updateAverages = (teamAPlayers: Player[], teamBPlayers: Player[]) => {
    setTeamAAvg(calculateAverageElo(teamAPlayers));
    setTeamBAvg(calculateAverageElo(teamBPlayers));
  };

  const movePlayer = (player: Player, fromTeam: "A" | "B") => {
    if (fromTeam === "A") {
      const newTeamA = teamA.filter((p) => p.id !== player.id);
      setTeamA(newTeamA);
      setTeamB([...teamB, player]);
      updateAverages(newTeamA, [...teamB, player]);
    } else {
      const newTeamB = teamB.filter((p) => p.id !== player.id);
      setTeamB(newTeamB);
      setTeamA([...teamA, player]);
      updateAverages([...teamA, player], newTeamB);
    }
  };

  const removePlayer = (player: Player, fromTeam: "A" | "B") => {
    if (fromTeam === "A") {
      const newTeamA = teamA.filter((p) => p.id !== player.id);
      setTeamA(newTeamA);
      updateAverages(newTeamA, teamB);
    } else {
      const newTeamB = teamB.filter((p) => p.id !== player.id);
      setTeamB(newTeamB);
      updateAverages(teamA, newTeamB);
    }
    setSelectedPlayers((prev) => prev.filter((id) => id !== player.id));
  };

  const balanceTeams = (players: Player[]): [Player[], Player[]] => {
    const totalPlayers = players.length;
    const targetTeamSize = Math.floor(totalPlayers / 2);
    let bestDifference = Infinity;
    let bestTeamA: Player[] = [];
    let bestTeamB: Player[] = [];

    const calculateTeamElo = (team: Player[]): number =>
      team.reduce((sum, player) => sum + player.elo, 0);

    const generateCombinations = (index: number, teamA: Player[]) => {
      if (teamA.length === targetTeamSize) {
        const teamB = players.filter((player) => !teamA.includes(player));
        const eloA = calculateTeamElo(teamA);
        const eloB = calculateTeamElo(teamB);
        const difference = Math.abs(eloA - eloB);

        if (difference < bestDifference) {
          bestDifference = difference;
          bestTeamA = [...teamA];
          bestTeamB = [...teamB];
        }
        return;
      }

      if (index >= totalPlayers) return;

      generateCombinations(index + 1, [...teamA, players[index]]);
      generateCombinations(index + 1, teamA);
    };

    generateCombinations(0, []);
    return [bestTeamA, bestTeamB];
  };

  const calculateAverageElo = (team: Player[]) => {
    if (team.length === 0) return 0;
    const totalElo = team.reduce((sum, player) => sum + player.elo, 0);
    return totalElo / team.length;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle title="Team Generator" />
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
            <CardTitle className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
              Team Generator
            </CardTitle>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Select players and generate balanced teams based on ELO ratings
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Player Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                Available Players
              </h3>
              <Badge variant="secondary">
                {selectedPlayers.length} selected
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {players.map((player) => (
                <Button
                  key={player.id}
                  variant={
                    selectedPlayers.includes(player.id) ? "default" : "outline"
                  }
                  className={`w-full justify-start space-x-2 ${
                    selectedPlayers.includes(player.id)
                      ? "bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                  onClick={() => handlePlayerToggle(player.id)}
                >
                  <User className="h-4 w-4" />
                  <span className="truncate">{player.name}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {player.elo}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-center ">
            <Button
              onClick={generateTeams}
              className="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white"
              disabled={selectedPlayers.length < 2}
            >
              <Shuffle className="mr-2 h-4 w-4 " />
              Generate Teams
            </Button>
          </div>

          {/* Teams Display */}
          {(teamA.length > 0 || teamB.length > 0) && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Team A */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                      Team A
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="bg-zinc-100 dark:bg-zinc-800"
                    >
                      Avg ELO: {teamAAvg.toFixed(0)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-2">
                      {teamA.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                        >
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-zinc-500" />
                            <span className="font-medium">{player.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{player.elo}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => movePlayer(player, "A")}
                              className="h-8 w-8 p-0"
                            >
                              <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePlayer(player, "A")}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Team B */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                      Team B
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="bg-zinc-100 dark:bg-zinc-800"
                    >
                      Avg ELO: {teamBAvg.toFixed(0)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-2">
                      {teamB.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                        >
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-zinc-500" />
                            <span className="font-medium">{player.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{player.elo}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => movePlayer(player, "B")}
                              className="h-8 w-8 p-0"
                            >
                              <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePlayer(player, "B")}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
