"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function CreatePlayer() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [elo, setElo] = useState("1500"); // Default Elo rating

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, elo: parseFloat(elo) }),
    });

    if (response.ok) {
      router.push("/players");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-3xl font-bold mb-4">Create New Player</h2>
      <div>
        <label htmlFor="name" className="block mb-2">
          Name:
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div>
        <label htmlFor="elo" className="block mb-2">
          Initial Elo Rating:
        </label>
        <input
          type="number"
          id="elo"
          value={elo}
          onChange={(e) => setElo(e.target.value)}
          required
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        Create Player
      </button>
    </form>
  );
}
