"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/PageTitle";

interface Player {
  id: number;
  name: string;
  elo: number;
  matches: number;
  wins: number;
}

export default function EditPlayerPage({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchPlayer = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/players/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch player");
      const data = await res.json();
      setPlayer(data);
    } catch (error) {
      console.error("Error fetching player:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchPlayer();
  }, [fetchPlayer]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!player) return;

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
    setPlayer((prev) =>
      prev ? { ...prev, [name]: name === "name" ? value : Number(value) } : null
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageTitle title="Loading..." />
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageTitle title="Player Not Found" />
        <div className="text-center">Player not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle title={`Edit ${player.name}`} />

      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/players">
            <Button
              variant="ghost"
              className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Players
            </Button>
          </Link>
        </div>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
              Edit Player: {player.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={player.name}
                  onChange={handleChange}
                  required
                  className="dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="elo">Elo Rating</Label>
                <Input
                  type="number"
                  id="elo"
                  name="elo"
                  value={player.elo}
                  onChange={handleChange}
                  required
                  className="dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="matches">Matches Played</Label>
                <Input
                  type="number"
                  id="matches"
                  name="matches"
                  value={player.matches}
                  onChange={handleChange}
                  required
                  className="dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wins">Wins</Label>
                <Input
                  type="number"
                  id="wins"
                  name="wins"
                  value={player.wins}
                  onChange={handleChange}
                  required
                  className="dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white"
                >
                  Update Player
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
