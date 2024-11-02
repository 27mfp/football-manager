"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import TeamSelector from "@/components/TeamSelector";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Player {
  id: number;
  name: string;
  elo: number;
}

interface PlayerMatch {
  id: number;
  matchId: number;
  playerId: number;
  team: string;
  paid: boolean;
  player: Player;
  eloBefore?: number | null;
  eloAfter?: number | null;
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
  const [isLoading, setIsLoading] = useState(true);
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

  const fetchMatch = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/matches`);
      const matches = await res.json();
      const matchData = matches.find((m: Match) => m.id === Number(params.id));

      if (!matchData) {
        throw new Error("Match not found");
      }

      setMatch(matchData);
      setDate(new Date(matchData.date).toISOString().split("T")[0]);
      setTime(matchData.time);
      setPrice(matchData.price.toString());
      setLocation(matchData.location);
      setResult(matchData.result || "");

      // Set teams with proper typing
      setTeamA(
        matchData.players
          .filter((pm: PlayerMatch) => pm.team === "A")
          .map((pm: PlayerMatch) => pm.player.id)
      );

      setTeamB(
        matchData.players
          .filter((pm: PlayerMatch) => pm.team === "B")
          .map((pm: PlayerMatch) => pm.player.id)
      );

      // Set payment status
      const status: { [key: number]: boolean } = {};
      matchData.players.forEach((pm: PlayerMatch) => {
        status[pm.player.id] = pm.paid;
      });
      setPaymentStatus(status);
    } catch (error) {
      console.error("Error fetching match:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchMatch();
    fetchPlayers();
  }, [fetchMatch]);

  const fetchPlayers = async () => {
    try {
      const res = await fetch("/api/players");
      const data = await res.json();
      setAllPlayers(data);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  const handleTeamsChange = (newTeamA: number[], newTeamB: number[]) => {
    setTeamA(newTeamA);
    setTeamB(newTeamB);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const [scoreA, scoreB] = result
        ? result.split("-").map(Number)
        : [null, null];

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
          scoreA,
          scoreB,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update match");
      }

      router.push("/matches");
      router.refresh();
    } catch (error) {
      console.error("Error updating match:", error);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!match) {
    return <div className="container mx-auto px-4 py-8">Match not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Match</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="result">Result</Label>
              <Input
                type="text"
                id="result"
                value={result}
                onChange={(e) => setResult(e.target.value)}
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
          </CardContent>

          <CardFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/matches")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white"
            >
              Update Match
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
