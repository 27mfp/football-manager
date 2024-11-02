import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Users, Shield } from "lucide-react";

interface Player {
  id: number;
  name: string;
  elo: number;
}

interface TeamSelectorProps {
  players: Player[];
  teamA: number[];
  teamB: number[];
  paymentStatus: { [key: number]: boolean };
  onTeamsChange: (teamA: number[], teamB: number[]) => void;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({
  players,
  teamA,
  teamB,
  paymentStatus,
  onTeamsChange,
}) => {
  const getPlayerTeam = (playerId: number) => {
    if (teamA.includes(playerId)) return "A";
    if (teamB.includes(playerId)) return "B";
    return null;
  };

  const handlePlayerClick = (
    playerId: number,
    targetTeam: "A" | "B" | null
  ) => {
    const currentTeam = getPlayerTeam(playerId);

    // Remove from current team
    let newTeamA = [...teamA];
    let newTeamB = [...teamB];

    if (currentTeam === "A") {
      newTeamA = newTeamA.filter((id) => id !== playerId);
    } else if (currentTeam === "B") {
      newTeamB = newTeamB.filter((id) => id !== playerId);
    }

    // Add to new team if specified
    if (targetTeam === "A" && currentTeam !== "A") {
      newTeamA.push(playerId);
    } else if (targetTeam === "B" && currentTeam !== "B") {
      newTeamB.push(playerId);
    }

    onTeamsChange(newTeamA, newTeamB);
  };

  const availablePlayers = players.filter(
    (player) => !teamA.includes(player.id) && !teamB.includes(player.id)
  );

  const getTeamPlayers = (team: "A" | "B") => {
    const teamIds = team === "A" ? teamA : teamB;
    return players.filter((player) => teamIds.includes(player.id));
  };

  const calculateAverageElo = (teamPlayers: Player[]) => {
    if (teamPlayers.length === 0) return 0;
    return Math.round(
      teamPlayers.reduce((sum, player) => sum + player.elo, 0) /
        teamPlayers.length
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Team A */}
        <Card className="p-4 border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
                Team A
              </h3>
            </div>
            <Badge
              variant="secondary"
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            >
              {getTeamPlayers("A").length} players
            </Badge>
          </div>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {getTeamPlayers("A").map((player) => (
                <div
                  key={player.id}
                  className="group flex items-center justify-between p-2 rounded-md bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {player.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {player.elo}
                    </span>
                    <button
                      onClick={() => handlePlayerClick(player.id, null)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Average ELO: {calculateAverageElo(getTeamPlayers("A"))}
            </p>
          </div>
        </Card>

        {/* Available Players */}
        <Card className="p-4 border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
                Available
              </h3>
            </div>
            <Badge
              variant="secondary"
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            >
              {availablePlayers.length} players
            </Badge>
          </div>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {availablePlayers.map((player) => (
                <div
                  key={player.id}
                  className="group flex items-center justify-between p-2 rounded-md bg-zinc-50 dark:bg-zinc-800/50"
                >
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {player.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {player.elo}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePlayerClick(player.id, "A")}
                        className="px-2 py-1 text-xs rounded bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        A
                      </button>
                      <button
                        onClick={() => handlePlayerClick(player.id, "B")}
                        className="px-2 py-1 text-xs rounded bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        B
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Team B */}
        <Card className="p-4 border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
                Team B
              </h3>
            </div>
            <Badge
              variant="secondary"
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            >
              {getTeamPlayers("B").length} players
            </Badge>
          </div>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {getTeamPlayers("B").map((player) => (
                <div
                  key={player.id}
                  className="group flex items-center justify-between p-2 rounded-md bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {player.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {player.elo}
                    </span>
                    <button
                      onClick={() => handlePlayerClick(player.id, null)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Average ELO: {calculateAverageElo(getTeamPlayers("B"))}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeamSelector;
