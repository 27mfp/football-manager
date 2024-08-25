"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TeamSelector from "@/components/TeamSelector";
import WeatherForecast from "@/components/WeatherForecast";
import { appConfig } from "@/config/appConfig";

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

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(data);
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
      <h2 className="text-3xl font-bold mb-6 text-center text-zinc-800 dark:text-white">
        Create New Match
      </h2>
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white dark:bg-zinc-800 shadow-md rounded-lg overflow-hidden"
      >
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full p-2 rounded border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Time
              </label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full p-2 rounded border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              Price
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-zinc-500 sm:text-sm">€</span>
              </div>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full pl-7 p-2 rounded border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              Location
            </label>
            <div className="flex items-center">
              <select
                id="location"
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(Number(e.target.value))}
                required
                className="flex-grow p-2 rounded-l border border-r-0 border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              >
                {appConfig.matchLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
              {date && time && selectedLocation && (
                <div className="bg-zinc-100 dark:bg-zinc-600 p-2 rounded-r border border-l-0 border-zinc-300 dark:border-zinc-600">
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
        </div>
        <div className="p-6 bg-zinc-50 dark:bg-zinc-700">
          <TeamSelector
            players={players}
            teamA={teamA}
            teamB={teamB}
            onTeamsChange={handleTeamsChange}
          />
        </div>
        <div className="px-6 py-4 bg-zinc-100 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Create Match
          </button>
        </div>
      </form>
    </div>
  );
}
