"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Player {
  id: number;
  name: string;
}

interface Match {
  id: number;
  date: string;
  time: string;
  price: number;
  location: string;
  result: string | null;
  teamA: Player[];
  teamB: Player[];
}

export default function EditMatch({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [result, setResult] = useState("");
  const [teamA, setTeamA] = useState<number[]>([]);
  const [teamB, setTeamB] = useState<number[]>([]);

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
    setTeamA(data.teamA.map((p: Player) => p.id));
    setTeamB(data.teamB.map((p: Player) => p.id));
  };

  const fetchPlayers = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/matches/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        time,
        price: parseFloat(price),
        location,
        result,
        teamA,
        teamB,
      }),
    });
    if (res.ok) {
      router.push("/matches");
      router.refresh();
    }
  };

  if (!match) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Edit Match</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block mb-2">
            Date:
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded"
            required
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
            className="w-full p-2 border rounded"
            required
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
            className="w-full p-2 border rounded"
            required
            step="0.01"
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
            className="w-full p-2 border rounded"
            required
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
            className="w-full p-2 border rounded"
            placeholder="e.g. 3-2"
          />
        </div>
        <div>
          <label className="block mb-2">Team A (select 5 players):</label>
          <select
            multiple
            value={teamA.map(String)}
            onChange={(e) =>
              setTeamA(
                Array.from(e.target.selectedOptions, (option) =>
                  Number(option.value)
                )
              )
            }
            className="w-full p-2 border rounded"
            size={5}
          >
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2">Team B (select 5 players):</label>
          <select
            multiple
            value={teamB.map(String)}
            onChange={(e) =>
              setTeamB(
                Array.from(e.target.selectedOptions, (option) =>
                  Number(option.value)
                )
              )
            }
            className="w-full p-2 border rounded"
            size={5}
          >
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Update Match
        </button>
      </form>
    </div>
  );
}
