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

  const generateTeams = () => {
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
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              {player.name} (Elo: {player.elo})
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={generateTeams}
        className="mb-4 bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800 text-white px-4 py-2 rounded"
      >
        Generate Teams
      </button>
      {teamA.length > 0 && teamB.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Team A</h3>
            <ul className="bg-white dark:bg-gray-800 rounded shadow p-2">
              {teamA.map((player) => (
                <li key={player.id}>
                  {player.name} (Elo: {player.elo})
                </li>
              ))}
            </ul>
            <p className="mt-2">
              Total Elo: {teamA.reduce((sum, player) => sum + player.elo, 0)}
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Team B</h3>
            <ul className="bg-white dark:bg-gray-800 rounded shadow p-2">
              {teamB.map((player) => (
                <li key={player.id}>
                  {player.name} (Elo: {player.elo})
                </li>
              ))}
            </ul>
            <p className="mt-2">
              Total Elo: {teamB.reduce((sum, player) => sum + player.elo, 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
