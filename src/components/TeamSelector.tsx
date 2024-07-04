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

  const generateBalancedTeams = () => {
    const sortedPlayers = [...players].sort((a, b) => b.elo - a.elo);
    const newTeamA: number[] = [];
    const newTeamB: number[] = [];
    let sumA = 0;
    let sumB = 0;

    sortedPlayers.forEach((player) => {
      if (sumA <= sumB) {
        newTeamA.push(player.id);
        sumA += player.elo;
      } else {
        newTeamB.push(player.id);
        sumB += player.elo;
      }
    });

    onTeamsChange(newTeamA, newTeamB);
  };

  const renderPlayer = (player: Player) => (
    <li
      key={player.id}
      className={`cursor-pointer p-1 rounded ${
        selectedPlayer === player.id ? "bg-blue-200" : ""
      }`}
      onClick={() => handlePlayerSelect(player.id)}
    >
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
    </li>
  );

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="w-1/3">
          <h3 className="font-bold mb-2">Unassigned Players</h3>
          <ul className="bg-gray-100 p-2 rounded">
            {unassignedPlayers.map(renderPlayer)}
          </ul>
        </div>
        <div className="w-1/3">
          <h3 className="font-bold mb-2">Team A</h3>
          <ul className="bg-gray-100 p-2 rounded">
            {players.filter((p) => teamA.includes(p.id)).map(renderPlayer)}
          </ul>
        </div>
        <div className="w-1/3">
          <h3 className="font-bold mb-2">Team B</h3>
          <ul className="bg-gray-100 p-2 rounded">
            {players.filter((p) => teamB.includes(p.id)).map(renderPlayer)}
          </ul>
        </div>
      </div>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => handleTeamAssign("A")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={!selectedPlayer}
        >
          Assign to Team A
        </button>
        <button
          onClick={() => handleTeamAssign("B")}
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={!selectedPlayer}
        >
          Assign to Team B
        </button>
      </div>
      <div className="flex justify-center">
        <button
          onClick={generateBalancedTeams}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Generate Balanced Teams
        </button>
      </div>
    </div>
  );
}
