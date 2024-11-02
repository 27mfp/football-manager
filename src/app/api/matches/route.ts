import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Player {
  id: number;
  name: string;
  elo: number;
  matches: number;
  wins: number;
}

interface PlayerMatch {
  id: number;
  matchId: number;
  playerId: number;
  team: string;
  paid: boolean;
  eloBefore?: number | null;
  eloAfter?: number | null;
  player: Player;
}

interface Match {
  id: number;
  date: Date;
  time: string;
  location: string;
  price: number;
  result: string | null;
  players: PlayerMatch[];
}

interface MatchWithPaymentInfo extends Match {
  pricePerPlayer: number;
  totalPaid: number;
  totalToPay: number;
}

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      include: {
        players: {
          include: {
            player: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    const matchesWithPaymentInfo = matches.map((match: Match) => {
      const totalPlayers = match.players.length;
      const pricePerPlayer = totalPlayers > 0 ? match.price / totalPlayers : 0;
      const totalPaid = match.players.reduce(
        (total, pm) => total + (pm.paid ? pricePerPlayer : 0),
        0
      );
      const totalToPay = match.price - totalPaid;

      return {
        ...match,
        pricePerPlayer,
        totalPaid,
        totalToPay,
      };
    });

    return NextResponse.json(matchesWithPaymentInfo);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, time, price, location, teamA, teamB } = body;

    const match = await prisma.match.create({
      data: {
        date: new Date(date),
        time,
        price,
        location,
        players: {
          create: [
            ...teamA.map((playerId: number) => ({
              playerId,
              team: "A",
              paid: false,
            })),
            ...teamB.map((playerId: number) => ({
              playerId,
              team: "B",
              paid: false,
            })),
          ],
        },
      },
      include: {
        players: {
          include: {
            player: true,
          },
        },
      },
    });

    return NextResponse.json(match);
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json(
      { error: "Failed to create match" },
      { status: 500 }
    );
  }
}
