import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { calculateEloChange, calculateTeamElo } from "@/utils/eloCalculator";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const match = await prisma.match.findUnique({
    where: { id: Number(params.id) },
    include: { teamA: true, teamB: true },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  return NextResponse.json(match);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { date, time, price, location, result, teamA, teamB } = body;

  const currentMatch = await prisma.match.findUnique({
    where: { id: Number(params.id) },
    include: { teamA: true, teamB: true },
  });

  const updatedMatch = await prisma.match.update({
    where: { id: Number(params.id) },
    data: {
      date: new Date(date),
      time,
      price,
      location,
      result,
      teamA: { set: teamA.map((id: number) => ({ id })) },
      teamB: { set: teamB.map((id: number) => ({ id })) },
    },
    include: { teamA: true, teamB: true },
  });

  // If result has changed, update Elo ratings
  if (result !== currentMatch?.result) {
    const [scoreA, scoreB] = result.split("-").map(Number);
    const teamAElo = calculateTeamElo(updatedMatch.teamA);
    const teamBElo = calculateTeamElo(updatedMatch.teamB);

    let scoreA_normalized = 0.5;
    if (scoreA > scoreB) scoreA_normalized = 1;
    if (scoreA < scoreB) scoreA_normalized = 0;

    for (const player of updatedMatch.teamA) {
      const eloChange = calculateEloChange(
        player.elo,
        teamBElo,
        scoreA_normalized
      );
      await prisma.player.update({
        where: { id: player.id },
        data: { elo: player.elo + eloChange },
      });
    }

    for (const player of updatedMatch.teamB) {
      const eloChange = calculateEloChange(
        player.elo,
        teamAElo,
        1 - scoreA_normalized
      );
      await prisma.player.update({
        where: { id: player.id },
        data: { elo: player.elo + eloChange },
      });
    }
  }

  return NextResponse.json(updatedMatch);
}
