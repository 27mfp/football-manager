"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Player {
  id: number;
  name: string;
}

interface PlayerMatch {
  id: number;
  player: Player;
  team: string;
  paid: boolean;
}

interface Match {
  id: number;
  date: string;
  time: string;
  price: number;
  location: string;
  result: string | null;
  players: PlayerMatch[];
}

export default function Matches() {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [previousMatches, setPreviousMatches] = useState<Match[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    const res = await fetch("/api/matches");
    const data = await res.json();
    const now = new Date();
    setUpcomingMatches(
      data
        .filter((match: Match) => new Date(match.date) > now)
        .sort(
          (a: Match, b: Match) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        )
    );
    setPreviousMatches(
      data
        .filter((match: Match) => new Date(match.date) <= now)
        .sort(
          (a: Match, b: Match) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )
    );
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this match?")) {
      const res = await fetch(`/api/matches/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchMatches();
        router.refresh();
      } else {
        alert("Failed to delete match");
      }
    }
  };

  const renderMatchList = (matches: Match[], title: string) => (
    <div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => {
          const totalPlayers = match.players.length;
          const pricePerPlayer =
            totalPlayers > 0 ? match.price / totalPlayers : 0;
          const teamA = match.players.filter((pm) => pm.team === "A");
          const teamB = match.players.filter((pm) => pm.team === "B");

          return (
            <div
              key={match.id}
              className="bg-[var(--card-bg)] p-4 rounded shadow"
            >
              <p className="font-bold">
                {new Date(match.date).toLocaleDateString()} at {match.time}
              </p>
              <p>Location: {match.location}</p>
              <p>Total Price: ${match.price.toFixed(2)}</p>
              <p>Price per Player: ${pricePerPlayer.toFixed(2)}</p>
              <p>Result: {match.result || "Not played yet"}</p>
              <div className="mt-2">
                <p className="font-semibold">Team A:</p>
                <ul className="list-disc list-inside">
                  {teamA.map((pm) => (
                    <li key={pm.id}>
                      {pm.player.name}
                      <span
                        className={pm.paid ? "text-green-500" : "text-red-500"}
                      >
                        {pm.paid ? " (Paid)" : " (Unpaid)"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <p className="font-semibold">Team B:</p>
                <ul className="list-disc list-inside">
                  {teamB.map((pm) => (
                    <li key={pm.id}>
                      {pm.player.name}
                      <span
                        className={pm.paid ? "text-green-500" : "text-red-500"}
                      >
                        {pm.paid ? " (Paid)" : " (Unpaid)"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 space-x-2">
                <Link
                  href={`/matches/${match.id}/edit`}
                  className="bg-[var(--secondary)] text-[var(--text)] px-2 py-1 rounded"
                >
                  Edit Match
                </Link>
                <Link
                  href={`/matches/${match.id}/payments`}
                  className="bg-[var(--secondary)] text-[var(--text)] px-2 py-1 rounded"
                >
                  Manage Payments
                </Link>
                <button
                  onClick={() => handleDelete(match.id)}
                  className="text-red-500 px-2 py-1 rounded"
                >
                  Delete Match
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Matches</h2>
      <Link
        href="/matches/create"
        className="bg-[var(--primary)] text-white px-4 py-2 rounded inline-block mb-4"
      >
        Create New Match
      </Link>
      {renderMatchList(upcomingMatches, "Upcoming Matches")}
      {renderMatchList(previousMatches, "Previous Matches")}
    </div>
  );
}
