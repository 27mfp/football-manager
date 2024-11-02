import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import eloSystem from "@/lib/eloSystem";

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
  player: Player;
  eloBefore?: number | null;
  eloAfter?: number | null;
}

interface Match {
  id: number;
  date: Date;
  time: string;
  location: string;
  result: string | null;
  price: number;
  players: PlayerMatch[];
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
        (sum, player) => sum + (player.paid ? pricePerPlayer : 0),
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      date,
      time,
      price,
      location,
      result,
      teamA,
      teamB,
      paymentStatus,
      scoreA,
      scoreB,
    } = body;

    const currentMatch = await prisma.match.findUnique({
      where: { id: Number(params.id) },
      include: {
        players: {
          include: {
            player: true,
          },
        },
      },
    });

    if (!currentMatch) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const allPlayers = await prisma.player.findMany({
      where: {
        id: {
          in: [...teamA, ...teamB],
        },
      },
    });

    // If there's a result and it's different from the current result
    if (result && result !== currentMatch.result) {
      const playerMap = new Map<number, Player>();
      allPlayers.forEach((player: Player) => {
        playerMap.set(player.id, player);
      });

      // Get team players with proper typing
      const teamAPlayers: Player[] = teamA
        .map((id: number) => playerMap.get(id))
        .filter((p: Player | undefined): p is Player => p !== undefined);

      const teamBPlayers: Player[] = teamB
        .map((id: number) => playerMap.get(id))
        .filter((p: Player | undefined): p is Player => p !== undefined);

      // Calculate new ratings
      const [updatedTeamA, updatedTeamB] = eloSystem.updateMatchRatings(
        teamAPlayers as unknown as {
          id: number;
          name: string;
          elo: number;
          matches: number;
          wins: number;
        }[],
        teamBPlayers as unknown as {
          id: number;
          name: string;
          elo: number;
          matches: number;
          wins: number;
        }[],
        scoreA,
        scoreB
      );

      // Update ELO map with new ratings
      const updatedEloMap = new Map<number, number>();
      updatedTeamA.forEach((p: Player) => updatedEloMap.set(p.id, p.elo));
      updatedTeamB.forEach((p: Player) => updatedEloMap.set(p.id, p.elo));

      // Update all players in a single transaction
      await prisma.$transaction(async (tx) => {
        // Update player ELOs
        await Promise.all(
          allPlayers.map((player: Player) => {
            const newElo = updatedEloMap.get(player.id);
            if (!newElo) return;

            return tx.player.update({
              where: { id: player.id },
              data: {
                elo: Math.round(newElo),
                matches: { increment: 1 },
                wins:
                  (teamA.includes(player.id) && scoreA > scoreB) ||
                  (teamB.includes(player.id) && scoreB > scoreA)
                    ? { increment: 1 }
                    : undefined,
              },
            });
          })
        );

        // Create match player records
        const matchPlayerRecords = [
          ...teamA.map((playerId: number) => ({
            playerId,
            team: "A" as const,
            paid: paymentStatus[playerId] || false,
            eloBefore: playerMap.get(playerId)?.elo || 1500,
            eloAfter:
              updatedEloMap.get(playerId) ||
              playerMap.get(playerId)?.elo ||
              1500,
          })),
          ...teamB.map((playerId: number) => ({
            playerId,
            team: "B" as const,
            paid: paymentStatus[playerId] || false,
            eloBefore: playerMap.get(playerId)?.elo || 1500,
            eloAfter:
              updatedEloMap.get(playerId) ||
              playerMap.get(playerId)?.elo ||
              1500,
          })),
        ];

        // Update match with new player records
        await tx.match.update({
          where: { id: Number(params.id) },
          data: {
            date: new Date(date),
            time,
            price,
            location,
            result,
            players: {
              deleteMany: {},
              create: matchPlayerRecords,
            },
          },
        });
      });

      // Fetch the updated match after all updates
      const finalUpdatedMatch = await prisma.match.findUnique({
        where: { id: Number(params.id) },
        include: {
          players: {
            include: {
              player: true,
            },
          },
        },
      });

      return NextResponse.json(finalUpdatedMatch);
    } else {
      // If no result or result hasn't changed, just update basic match info
      const updatedMatch = await prisma.match.update({
        where: { id: Number(params.id) },
        data: {
          date: new Date(date),
          time,
          price,
          location,
          result,
          players: {
            deleteMany: {},
            create: [
              ...teamA.map((playerId: number) => ({
                playerId,
                team: "A",
                paid: paymentStatus[playerId] || false,
              })),
              ...teamB.map((playerId: number) => ({
                playerId,
                team: "B",
                paid: paymentStatus[playerId] || false,
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

      return NextResponse.json(updatedMatch);
    }
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = Number(params.id);

    // First, fetch the match to get player information and ELO changes
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        players: {
          include: {
            player: true,
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // If the match has a result, revert ELO changes
    if (match.result) {
      // Parse the result
      const [scoreA, scoreB] = match.result.split("-").map(Number);

      // Get all player matches that need ELO reversion
      for (const playerMatch of match.players) {
        // Only update if ELO changes are recorded
        if (playerMatch.eloBefore !== null && playerMatch.eloAfter !== null) {
          await prisma.player.update({
            where: { id: playerMatch.player.id },
            data: {
              elo: playerMatch.eloBefore,
              matches: { decrement: 1 },
              // Decrement wins if this player was on the winning team
              wins:
                (playerMatch.team === "A" && scoreA > scoreB) ||
                (playerMatch.team === "B" && scoreB > scoreA)
                  ? { decrement: 1 }
                  : undefined,
            },
          });
        }
      }
    }

    // Delete all player matches associated with this match
    await prisma.playerMatch.deleteMany({
      where: { matchId },
    });

    // Finally, delete the match itself
    await prisma.match.delete({
      where: { id: matchId },
    });

    return NextResponse.json({
      message: "Match and associated records deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting match:", error);
    return NextResponse.json(
      { error: "Failed to delete match" },
      { status: 500 }
    );
  }
}
