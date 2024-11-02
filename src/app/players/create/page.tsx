"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitle } from "@/components/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
      <PageTitle title="Create Player" />

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
              Create New Player
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
                  placeholder="Enter player name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="elo">Initial Elo</Label>
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

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white"
                >
                  Create Player
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
