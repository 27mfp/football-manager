"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePlayerPage() {
  const [player, setPlayer] = useState({
    name: "",
    elo: 1500,
    matches: 0,
    wins: 0,
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(player),
      });
      if (!res.ok) throw new Error("Failed to create player");
      router.push("/players");
      router.refresh();
    } catch (error) {
      console.error("Error creating player:", error);
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-zinc-800 dark:text-white mb-6">
        Create New Player
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-800 shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label
            className="block text-zinc-700 dark:text-zinc-300 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={player.name}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-zinc-700 dark:text-zinc-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-zinc-700 dark:border-zinc-600"
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-zinc-700 dark:text-zinc-300 text-sm font-bold mb-2"
            htmlFor="elo"
          >
            Initial Elo:
          </label>
          <input
            type="number"
            id="elo"
            name="elo"
            value={player.elo}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-zinc-700 dark:text-zinc-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-zinc-700 dark:border-zinc-600"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Create Player
          </button>
        </div>
      </form>
    </div>
  );
}
