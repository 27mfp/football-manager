"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface WeatherForecastProps {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
}

const getWeatherEmoji = (description: string, temperature: number): string => {
  const desc = description.toLowerCase();

  // Temperature based emojis
  if (temperature > 30) return "🌡️";
  if (temperature < 5) return "❄️";

  // Weather condition based emojis
  if (desc.includes("clear")) return "☀️";
  if (desc.includes("sunny")) return "☀️";
  if (desc.includes("cloud")) return "☁️";
  if (desc.includes("overcast")) return "☁️";
  if (desc.includes("rain")) return "🌧️";
  if (desc.includes("shower")) return "🌧️";
  if (desc.includes("drizzle")) return "🌦️";
  if (desc.includes("thunder")) return "⛈️";
  if (desc.includes("snow")) return "🌨️";
  if (desc.includes("fog")) return "🌫️";
  if (desc.includes("mist")) return "🌫️";

  return "🌤️"; // default
};

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
      <div className="animate-pulse flex items-center space-x-2">
        <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading weather...
        </span>
      </div>
    );

  if (error)
    return (
      <span className="text-sm text-red-500 flex items-center space-x-1">
        <span>⚠️</span>
        <span>{error}</span>
      </span>
    );

  if (!weather) return null;

  const emoji = getWeatherEmoji(weather.description, weather.temperature);

  return (
    <div className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-md">
      <span className="text-xl" role="img" aria-label="weather">
        {emoji}
      </span>
      <p className="text-sm text-zinc-700 dark:text-zinc-300">
        {Math.round(weather.temperature)}°C, {weather.description}
      </p>
    </div>
  );
};

export default WeatherForecast;
