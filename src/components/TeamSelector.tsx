// src/components/TeamSelector.tsx

import React, { useState } from "react";

interface Player {
  id: number;
  name: string;
  elo: number;
}

interface TeamSelectorProps {
  players: Player[];
  teamA: number[];
  teamB: number[];
  onTeamsChange: (teamA: number[], teamB: number[]) => void;
  paymentStatus?: { [key: number]: boolean };
}

export default function TeamSelector({
  players,
  teamA,
  teamB,
  onTeamsChange,
  paymentStatus = {},
}: TeamSelectorProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);

  const unassignedPlayers = players.filter(
    (p) => !teamA.includes(p.id) && !teamB.includes(p.id)
  );

  const handlePlayerSelect = (playerId: number) => {
    setSelectedPlayer(playerId);
  };

  const handleTeamAssign = (team: "A" | "B") => {
    if (selectedPlayer) {
      const newTeamA =
        team === "A"
          ? [...teamA, selectedPlayer]
          : teamA.filter((id) => id !== selectedPlayer);
      const newTeamB =
        team === "B"
          ? [...teamB, selectedPlayer]
          : teamB.filter((id) => id !== selectedPlayer);
      onTeamsChange(newTeamA, newTeamB);
      setSelectedPlayer(null);
    }
  };

  const handleRemoveFromTeam = (playerId: number) => {
    const newTeamA = teamA.filter((id) => id !== playerId);
    const newTeamB = teamB.filter((id) => id !== playerId);
    onTeamsChange(newTeamA, newTeamB);
  };

  const renderPlayer = (player: Player, team: "A" | "B" | null) => (
    <li
      key={player.id}
      className={`cursor-pointer p-1 rounded flex justify-between items-center ${
        selectedPlayer === player.id
          ? "bg-zinc-200 text-black dark:bg-zinc-500 dark:text-white"
          : ""
      }`}
      onClick={() => handlePlayerSelect(player.id)}
    >
      <span>
        {player.name} (Elo: {player.elo.toFixed(0)})
        {paymentStatus[player.id] !== undefined && (
          <span
            className={`ml-2 ${
              paymentStatus[player.id] ? "text-green-500" : "text-red-500"
            }`}
          >
            {paymentStatus[player.id] ? "Paid" : "Unpaid"}
          </span>
        )}
      </span>
      {team && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveFromTeam(player.id);
          }}
          className="bg-zinc-100 text-black dark:bg-zinc-700 dark:text-white px-2 py-1 rounded text-xs"
        >
          Remove
        </button>
      )}
    </li>
  );

  const sortedPlayers = [...unassignedPlayers].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="w-1/3">
          <h3 className="font-bold mb-2">Unassigned Players</h3>
          <ul className="bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white p-2 rounded">
            {sortedPlayers.map((player) => renderPlayer(player, null))}
          </ul>
        </div>
        <div className="w-1/3">
          <h3 className="font-bold mb-2">Team A</h3>
          <ul className="bg-zinc-100 text-black dark:bg-zinc-700 dark:text-white p-2 rounded">
            {players
              .filter((p) => teamA.includes(p.id))
              .map((player) => renderPlayer(player, "A"))}
          </ul>
        </div>
        <div className="w-1/3">
          <h3 className="font-bold mb-2">Team B</h3>
          <ul className="bg-zinc-100 text-black dark:bg-zinc-700 dark:text-white p-2 rounded">
            {players
              .filter((p) => teamB.includes(p.id))
              .map((player) => renderPlayer(player, "B"))}
          </ul>
        </div>
      </div>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => handleTeamAssign("A")}
          className="bg-zinc-100 text-black dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-800 px-4 py-2 rounded"
          disabled={!selectedPlayer}
        >
          Assign to Team A
        </button>
        <button
          onClick={() => handleTeamAssign("B")}
          className="bg-zinc-100 text-black dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-800 px-4 py-2 rounded"
          disabled={!selectedPlayer}
        >
          Assign to Team B
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="w-1/3">
          <h3 className="font-bold mb-2">Unassigned Players</h3>
          <ul className="bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white p-2 rounded">
            {unassignedPlayers.map((player) => renderPlayer(player, null))}
          </ul>
        </div>
        <div className="w-1/3">
          <h3 className="font-bold mb-2">Team A</h3>
          <ul className="bg-zinc-100 text-black dark:bg-zinc-700 dark:text-white p-2 rounded">
            {players
              .filter((p) => teamA.includes(p.id))
              .map((player) => renderPlayer(player, "A"))}
          </ul>
        </div>
        <div className="w-1/3">
          <h3 className="font-bold mb-2">Team B</h3>
          <ul className="bg-zinc-100 text-black dark:bg-zinc-700 dark:text-white p-2 rounded">
            {players
              .filter((p) => teamB.includes(p.id))
              .map((player) => renderPlayer(player, "B"))}
          </ul>
        </div>
      </div>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => handleTeamAssign("A")}
          className="bg-zinc-100 text-black dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-800 px-4 py-2 rounded"
          disabled={!selectedPlayer}
        >
          Assign to Team A
        </button>
        <button
          onClick={() => handleTeamAssign("B")}
          className="bg-zinc-100 text-black dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-800 px-4 py-2 rounded"
          disabled={!selectedPlayer}
        >
          Assign to Team B
        </button>
      </div>
    </div>
  );
}
