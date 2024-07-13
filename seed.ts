import { PrismaClient } from "@prisma/client";
import { parse, setHours, setMinutes } from "date-fns";
import fs from "fs";

const prisma = new PrismaClient();

interface MatchData {
  venue: string;
  date: string;
  team1: Array<{ name: string }>;
  team2: Array<{ name: string }>;
  team1_goals: string;
  team2_goals: string;
}

interface PlayerData {
  name: string;
  rating: number;
  matches: number;
  wins: number;
}

interface JsonData {
  players: PlayerData[];
  matches: MatchData[];
}

async function main() {
  // Read and parse the JSON file
  const jsonData: JsonData = JSON.parse(
    fs.readFileSync("./match_db.json", "utf-8")
  );

  // Clear existing data
  await prisma.playerMatch.deleteMany();
  await prisma.match.deleteMany();
  await prisma.player.deleteMany();

  console.log("Seeding database...");

  // Seed players
  for (const playerData of jsonData.players) {
    await prisma.player.create({
      data: {
        name: playerData.name,
        elo: playerData.rating,
        matches: playerData.matches,
        wins: playerData.wins,
      },
    });
  }

  // Seed matches and player matches
  for (const matchData of jsonData.matches) {
    let date = parse(matchData.date, "dd-MM-yyyy", new Date());
    date = setHours(date, 22);
    date = setMinutes(date, 0);

    const match = await prisma.match.create({
      data: {
        date,
        time: "22:00",
        price: 40, // Set price to 40 euros
        location: matchData.venue,
        result: `${matchData.team1_goals} - ${matchData.team2_goals}`,
      },
    });

    // Create player matches for both teams
    for (const [teamName, teamData] of Object.entries({
      team1: matchData.team1,
      team2: matchData.team2,
    })) {
      for (const playerData of teamData) {
        const player = await prisma.player.findFirst({
          where: { name: playerData.name },
        });

        if (player) {
          await prisma.playerMatch.create({
            data: {
              playerId: player.id,
              matchId: match.id,
              team: teamName === "team1" ? "A" : "B",
              paid: false,
              eloBefore: player.elo, // Use current ELO for eloBefore
              eloAfter: player.elo, // Use current ELO for eloAfter
            },
          });
        }
      }
    }
  }

  console.log("Seeding completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
