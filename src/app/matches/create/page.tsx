"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TeamSelector from "@/components/TeamSelector";
import WeatherForecast from "@/components/WeatherForecast";
import { appConfig } from "@/config/appConfig";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Clock, Euro, MapPin } from "lucide-react";
import { PageTitle } from "@/components/PageTitle";

interface Player {
  id: number;
  name: string;
  elo: number;
}

export default function CreateMatch() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState(
    appConfig.matchLocations[0].id
  );
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamA, setTeamA] = useState<number[]>([]);
  const [teamB, setTeamB] = useState<number[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    const sortedPlayers = data.sort((a: Player, b: Player) =>
      a.name.localeCompare(b.name)
    );
    setPlayers(sortedPlayers);
  };

  const handleTeamsChange = (newTeamA: number[], newTeamB: number[]) => {
    setTeamA(newTeamA);
    setTeamB(newTeamB);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedLocation = appConfig.matchLocations.find(
      (loc) => loc.id === selectedLocationId
    );
    const response = await fetch("/api/matches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date,
        time,
        price: parseFloat(price),
        location: selectedLocation?.name,
        teamA,
        teamB,
      }),
    });
    if (response.ok) {
      router.push("/matches");
      router.refresh();
    }
  };

  const selectedLocation = appConfig.matchLocations.find(
    (loc) => loc.id === selectedLocationId
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle title="Create Match" />
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-zinc-800 dark:text-zinc-200">
          Create New Match
        </h2>

        <form onSubmit={handleSubmit}>
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xl text-zinc-800 dark:text-zinc-200">
                Match Details
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Field */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Date
                  </Label>
                  <Input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                  />
                </div>

                {/* Time Field */}
                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time
                  </Label>
                  <Input
                    type="time"
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              {/* Price Field */}
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  Price
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    €
                  </span>
                  <Input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="pl-8 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Location Field */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedLocationId.toString()}
                    onValueChange={(value) =>
                      setSelectedLocationId(Number(value))
                    }
                  >
                    <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {appConfig.matchLocations.map((location) => (
                        <SelectItem
                          key={location.id}
                          value={location.id.toString()}
                        >
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {date && time && selectedLocation && (
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-md border border-zinc-200 dark:border-zinc-700">
                      <WeatherForecast
                        date={date}
                        time={time}
                        latitude={selectedLocation.latitude}
                        longitude={selectedLocation.longitude}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Team Selector */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardContent className="pt-6">
                  <TeamSelector
                    players={players}
                    teamA={teamA}
                    teamB={teamB}
                    paymentStatus={paymentStatus}
                    onTeamsChange={handleTeamsChange}
                  />
                </CardContent>
              </Card>
            </CardContent>

            <CardFooter className="bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700">
              <Button
                type="submit"
                className="w-full bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 mt-4 dark:text-white"
              >
                Create Match
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
