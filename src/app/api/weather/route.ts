// app/api/weather/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  if (!lat || !lon || !date || !time) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const targetDate = new Date(`${date}T${time}`);
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    const forecast = response.data.list.reduce((closest: any, current: any) => {
      const currentDate = new Date(current.dt * 1000);
      const closestDate = new Date(closest.dt * 1000);
      return Math.abs(currentDate.getTime() - targetDate.getTime()) <
        Math.abs(closestDate.getTime() - targetDate.getTime())
        ? current
        : closest;
    });

    const weatherData = {
      temperature: forecast.main.temp,
      description: forecast.weather[0].description,
      // Add any other weather data you want to include
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
