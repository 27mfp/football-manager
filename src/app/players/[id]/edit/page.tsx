"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditPlayerPage({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState({
    name: "",
    elo: 0,
    matches: 0,
    wins: 0,
  });
  const router = useRouter();

  useEffect(() => {
    fetchPlayer();
  }, []);

  const fetchPlayer = async () => {
    try {
      const res = await fetch(`/api/players/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch player");
      const data = await res.json();
      setPlayer(data);
    } catch (error) {
      console.error("Error fetching player:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/players/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(player),
      });
      if (!res.ok) throw new Error("Failed to update player");
      router.push("/players");
      router.refresh();
    } catch (error) {
      console.error("Error updating player:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPlayer((prev) => ({
      ...prev,
      [name]: name === "name" ? value : Number(value),
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Edit Player</h1>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={player.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="elo">Elo:</label>
        <input
          type="number"
          id="elo"
          name="elo"
          value={player.elo}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="matches">Matches:</label>
        <input
          type="number"
          id="matches"
          name="matches"
          value={player.matches}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="wins">Wins:</label>
        <input
          type="number"
          id="wins"
          name="wins"
          value={player.wins}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Update Player</button>
    </form>
  );
}
