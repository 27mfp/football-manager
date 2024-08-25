// components/WeatherForecast.tsx
"use client";
import { useState, useEffect } from "react";
import axios from "axios";

interface WeatherForecastProps {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({
  date,
  time,
  latitude,
  longitude,
}) => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(
          `/api/weather?lat=${latitude}&lon=${longitude}&date=${date}&time=${time}`
        );
        setWeather(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching weather:", error);
        setError("Failed to fetch weather data");
        setLoading(false);
      }
    };

    if (date && time) {
      fetchWeather();
    }
  }, [latitude, longitude, date, time]);

  if (loading)
    return (
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        Loading...
      </span>
    );
  if (error)
    return <span className="text-sm text-red-500">Error: {error}</span>;
  if (!weather) return null;

  return (
    <p className="text-sm text-zinc-700 dark:text-zinc-300">
      {Math.round(weather.temperature)}°C, {weather.description}
    </p>
  );
};

export default WeatherForecast;
