"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, Clock, Users } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [playerMatches, setPlayerMatches] = useState<PlayerMatch[]>([]);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`/api/matches`); // Changed to fetch all matches
        if (!res.ok) throw new Error("Failed to fetch match data");

        const matches = await res.json();
        console.log("Raw API response:", matches);

        // Find the specific match by ID
        const currentMatch = matches.find(
          (m: any) => m.id === Number(params.id)
        );

        if (!currentMatch) {
          throw new Error("Match not found");
        }

        // Set the match data
        setMatch(currentMatch);
        setPlayerMatches(currentMatch.players || []);
      } catch (error) {
        console.error("Detailed error:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatch();
  }, [params.id]);

  const handlePaymentToggle = (playerMatchId: number) => {
    setPlayerMatches((prevMatches) =>
      prevMatches.map((pm) =>
        pm.id === playerMatchId ? { ...pm, paid: !pm.paid } : pm
      )
    );
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`/api/matches/${params.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerMatches }),
      });

      if (!res.ok) throw new Error("Failed to update payments");

      router.push("/matches");
      router.refresh();
    } catch (error) {
      console.error("Error updating payments:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update payments"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-zinc-600 dark:text-zinc-400">
              Loading match data...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="text-red-600 dark:text-red-400 font-medium">
              {error || "Match not found"}
            </div>
            <Button onClick={() => router.push("/matches")} variant="outline">
              Return to Matches
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPlayers = playerMatches.length || 1; // Prevent division by zero
  const pricePerPlayer = match.price / totalPlayers;
  const totalPaid =
    playerMatches.filter((pm) => pm.paid).length * pricePerPlayer;
  const totalRemaining = match.price - totalPaid;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
            Match Payments
          </CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <Calendar className="h-4 w-4" />
              <span>{new Date(match.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <Clock className="h-4 w-4" />
              <span>{match.time}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <DollarSign className="h-4 w-4" />
              <span>Price per player: ${pricePerPlayer.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <Users className="h-4 w-4" />
              <span>{playerMatches.length} players</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {playerMatches.map((pm) => (
              <div
                key={pm.id}
                className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {pm.player.name}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    Team {pm.team}
                  </span>
                </div>
                <Button
                  onClick={() => handlePaymentToggle(pm.id)}
                  variant={pm.paid ? "default" : "outline"}
                  className={`min-w-[100px] ${
                    pm.paid
                      ? "bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white"
                      : ""
                  }`}
                >
                  {pm.paid ? "Paid" : "Unpaid"}
                </Button>
              </div>
            ))}
          </div>

          {playerMatches.length > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Total Paid:
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    ${totalPaid.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Remaining:
                  </span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    ${totalRemaining.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end pt-6">
          <Button
            onClick={handleSubmit}
            className="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white"
            disabled={playerMatches.length === 0}
          >
            Save Payments
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
