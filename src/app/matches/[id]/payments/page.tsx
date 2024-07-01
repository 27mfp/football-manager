"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Player {
  id: number;
  name: string;
  paid: boolean;
}

interface Match {
  id: number;
  date: string;
  time: string;
  price: number;
  location: string;
  teamA: Player[];
  teamB: Player[];
}

export default function MatchPayments({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    fetchMatch();
  }, []);

  const fetchMatch = async () => {
    const res = await fetch(`/api/matches/${params.id}`);
    const data = await res.json();
    setMatch(data);
    setPlayers([...data.teamA, ...data.teamB]);
  };

  const handlePaymentToggle = (playerId: number) => {
    setPlayers(
      players.map((player) =>
        player.id === playerId ? { ...player, paid: !player.paid } : player
      )
    );
  };

  const handleSubmit = async () => {
    const res = await fetch(`/api/matches/${params.id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players }),
    });

    if (res.ok) {
      // Fetch the updated match and player data
      const updatedMatch = await res.json();
      setPlayers(updatedMatch.players);
      router.push("/matches");
      router.refresh();
    }
  };

  if (!match) return <div>Loading...</div>;

  const pricePerPlayer = match.price / players.length;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Match Payments</h2>
      <p className="mb-4">
        Match Date: {new Date(match.date).toLocaleDateString()} at {match.time}
      </p>
      <p className="mb-4">Price per player: ${pricePerPlayer.toFixed(2)}</p>
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded shadow"
          >
            <span>{player.name}</span>
            <button
              onClick={() => handlePaymentToggle(player.id)}
              className={`px-4 py-2 rounded ${
                player.paid
                  ? "bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800"
                  : "bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800"
              } text-white`}
            >
              {player.paid ? "Paid" : "Unpaid"}
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Save Payments
      </button>
    </div>
  );
}
