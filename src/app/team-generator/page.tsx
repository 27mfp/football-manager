"use client";

import { useState, useEffect } from "react";

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

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(data);
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
    selected.sort((a, b) => b.elo - a.elo);

    const teamA: Player[] = [];
    const teamB: Player[] = [];
    let sumA = 0;
    let sumB = 0;

    selected.forEach((player) => {
      if (sumA <= sumB) {
        teamA.push(player);
        sumA += player.elo;
      } else {
        teamB.push(player);
        sumB += player.elo;
      }
    });

    setTeamA(teamA);
    setTeamB(teamB);
  };

  const calculateAverageElo = (team: Player[]) => {
    if (team.length === 0) return 0;
    const totalElo = team.reduce((sum, player) => sum + player.elo, 0);
    return totalElo / team.length;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Team Generator</h2>
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2">Select Players</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {players.map((player) => (
            <button
              key={player.id}
              onClick={() => handlePlayerToggle(player.id)}
              className={`p-2 rounded ${
                selectedPlayers.includes(player.id)
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--secondary)] text-[var(--text)]"
              }`}
            >
              {player.name} (Elo: {player.elo})
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={generateTeams}
        className="bg-[var(--primary)] text-white mb-4 px-4 py-2 rounded"
      >
        Generate Teams
      </button>
      {teamA.length > 0 && teamB.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Team A</h3>
            <ul className="bg-[var(--card-bg)] rounded p-2">
              {teamA.map((player) => (
                <li key={player.id}>
                  {player.name} (Elo: {player.elo})
                </li>
              ))}
            </ul>
            <p className="mt-2">
              Average Elo: {calculateAverageElo(teamA).toFixed(2)}
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Team B</h3>
            <ul className="bg-[var(--card-bg)] rounded p-2">
              {teamB.map((player) => (
                <li key={player.id}>
                  {player.name} (Elo: {player.elo})
                </li>
              ))}
            </ul>
            <p className="mt-2">
              Average Elo: {calculateAverageElo(teamB).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
