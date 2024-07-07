"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { theme } from "@/styles/theme";
import TeamSelector from "@/components/TeamSelector";

interface Player {
  id: number;
  name: string;
  elo: number;
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

export default function EditMatch({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [result, setResult] = useState("");
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [teamA, setTeamA] = useState<number[]>([]);
  const [teamB, setTeamB] = useState<number[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<{
    [key: number]: boolean;
  }>({});
  const currentTheme = useTheme();

  useEffect(() => {
    fetchMatch();
    fetchPlayers();
  }, []);

  const fetchMatch = async () => {
    const res = await fetch(`/api/matches/${params.id}`);
    const data = await res.json();
    setMatch(data);
    setDate(data.date.split("T")[0]);
    setTime(data.time);
    setPrice(data.price.toString());
    setLocation(data.location);
    setResult(data.result || "");
    setTeamA(
      data.players
        .filter((pm: PlayerMatch) => pm.team === "A")
        .map((pm: PlayerMatch) => pm.player.id)
    );
    setTeamB(
      data.players
        .filter((pm: PlayerMatch) => pm.team === "B")
        .map((pm: PlayerMatch) => pm.player.id)
    );

    const status: { [key: number]: boolean } = {};
    data.players.forEach((pm: PlayerMatch) => {
      status[pm.player.id] = pm.paid;
    });
    setPaymentStatus(status);
  };

  const fetchPlayers = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    setAllPlayers(data);
  };

  const handleTeamsChange = (newTeamA: number[], newTeamB: number[]) => {
    setTeamA(newTeamA);
    setTeamB(newTeamB);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`/api/matches/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date,
        time,
        price: parseFloat(price),
        location,
        result,
        teamA,
        teamB,
        paymentStatus,
      }),
    });

    if (response.ok) {
      router.push("/matches");
      router.refresh();
    }
  };

  if (!match) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-3xl font-bold mb-4">Edit Match</h2>
      <div>
        <label htmlFor="date" className="block mb-2">
          Date:
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full p-2 rounded bg-[var(--card-bg)] text-[var(--text)]"
        />
      </div>
      <div>
        <label htmlFor="time" className="block mb-2">
          Time:
        </label>
        <input
          type="time"
          id="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          className="w-full p-2 rounded"
        />
      </div>
      <div>
        <label htmlFor="price" className="block mb-2">
          Price:
        </label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="w-full p-2 rounded"
        />
      </div>
      <div>
        <label htmlFor="location" className="block mb-2">
          Location:
        </label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          className="w-full p-2 rounded"
        />
      </div>
      <div>
        <label htmlFor="result" className="block mb-2">
          Result:
        </label>
        <input
          type="text"
          id="result"
          value={result}
          onChange={(e) => setResult(e.target.value)}
          className="w-full p-2 rounded"
          placeholder="e.g. 3-2"
        />
      </div>
      <TeamSelector
        players={allPlayers}
        teamA={teamA}
        teamB={teamB}
        onTeamsChange={handleTeamsChange}
        paymentStatus={paymentStatus}
      />
      <button type="submit" className="px-4 py-2 rounded">
        Update Match
      </button>
    </form>
  );
}