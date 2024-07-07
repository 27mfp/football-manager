"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PlayerMatch {
  id: number;
  player: {
    id: number;
    name: string;
  };
  paid: boolean;
  team: string;
}

interface Match {
  id: number;
  date: string;
  time: string;
  price: number;
  location: string;
  players: PlayerMatch[];
}

export default function MatchPayments({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [playerMatches, setPlayerMatches] = useState<PlayerMatch[]>([]);

  useEffect(() => {
    fetchMatch();
  }, []);

  const fetchMatch = async () => {
    const res = await fetch(`/api/matches/${params.id}`);
    const data = await res.json();
    setMatch(data);
    setPlayerMatches(data.players);
  };

  const handlePaymentToggle = (playerMatchId: number) => {
    setPlayerMatches(
      playerMatches.map((pm) =>
        pm.id === playerMatchId ? { ...pm, paid: !pm.paid } : pm
      )
    );
  };

  const handleSubmit = async () => {
    const res = await fetch(`/api/matches/${params.id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerMatches }),
    });

    if (res.ok) {
      router.push("/matches");
      router.refresh();
    }
  };

  if (!match) return <div>Loading...</div>;

  const pricePerPlayer = match.price / playerMatches.length;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Match Payments</h2>
      <p className="mb-4">
        Match Date: {new Date(match.date).toLocaleDateString()} at {match.time}
      </p>
      <p className="mb-4">Price per player: ${pricePerPlayer.toFixed(2)}</p>
      <div className="space-y-2">
        {playerMatches.map((pm) => (
          <div
            key={pm.id}
            className="flex items-center justify-between p-2 bg-[var(--card-bg)] rounded"
          >
            <span>
              {pm.player.name} (Team {pm.team})
            </span>
            <button
              onClick={() => handlePaymentToggle(pm.id)}
              className={`px-4 py-2 rounded ${
                pm.paid
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              } text-white`}
            >
              {pm.paid ? "Paid" : "Unpaid"}
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        className="bg-[var(--primary)] text-white mt-4 px-4 py-2 rounded"
      >
        Save Payments
      </button>
    </div>
  );
}
