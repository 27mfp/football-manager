import type { Player } from "@prisma/client";

interface EloConfig {
  kFactor?: number;
}

interface EloChanges {
  teamA: {
    win: number;
    lose: number;
  };
  teamB: {
    win: number;
    lose: number;
  };
}

type MatchResult = "win" | "loss" | "draw";

class EloSystem {
  private config: Required<EloConfig>;

  constructor(config: EloConfig = {}) {
    this.config = {
      kFactor: config.kFactor || 50,
    };
  }

  calculateExpectedScore(playerRating: number, opponentRating: number): number {
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  }

  calculatePotentialEloChanges(
    teamARating: number,
    teamBRating: number
  ): EloChanges {
    const expectedScoreA = this.calculateExpectedScore(
      teamARating,
      teamBRating
    );

    const teamAWinChange = Math.round(
      this.config.kFactor * (1 - expectedScoreA)
    );
    const teamALoseChange = Math.round(
      this.config.kFactor * (0 - expectedScoreA)
    );

    const teamBWinChange = Math.round(this.config.kFactor * expectedScoreA);
    const teamBLoseChange = Math.round(
      this.config.kFactor * (expectedScoreA - 1)
    );

    return {
      teamA: { win: teamAWinChange, lose: teamALoseChange },
      teamB: { win: teamBWinChange, lose: teamBLoseChange },
    };
  }

  calculateNewRating(
    playerRating: number,
    opponentRating: number,
    actualScore: number
  ): number {
    const expectedScore = this.calculateExpectedScore(
      playerRating,
      opponentRating
    );
    return Math.round(
      playerRating + this.config.kFactor * (actualScore - expectedScore)
    );
  }

  calculateTeamAverageRating(team: Player[]): number {
    if (team.length === 0) return 0;
    return team.reduce((sum, player) => sum + player.elo, 0) / team.length;
  }

  updateMatchRatings(
    team1: Player[],
    team2: Player[],
    score1: number,
    score2: number
  ): [Player[], Player[]] {
    const team1AvgRating = this.calculateTeamAverageRating(team1);
    const team2AvgRating = this.calculateTeamAverageRating(team2);

    const updateTeam = (
      team: Player[],
      opponentAvgRating: number,
      result: MatchResult
    ): Player[] => {
      return team.map((player) => {
        let actualScore: number;

        if (result === "win") actualScore = 1;
        else if (result === "loss") actualScore = 0;
        else return player; // No change for draw

        const newRating = this.calculateNewRating(
          player.elo,
          opponentAvgRating,
          actualScore
        );

        return {
          ...player,
          elo: newRating,
          matches: (player.matches || 0) + 1,
          wins: (player.wins || 0) + (result === "win" ? 1 : 0),
        };
      });
    };

    // Determine the match result
    let team1Result: MatchResult;
    let team2Result: MatchResult;

    if (score1 > score2) {
      team1Result = "win";
      team2Result = "loss";
    } else if (score1 < score2) {
      team1Result = "loss";
      team2Result = "win";
    } else {
      team1Result = team2Result = "draw";
    }

    const updatedTeam1 = updateTeam(team1, team2AvgRating, team1Result);
    const updatedTeam2 = updateTeam(team2, team1AvgRating, team2Result);

    return [updatedTeam1, updatedTeam2];
  }
}

const eloSystem = new EloSystem({
  kFactor: 50,
});

export default eloSystem;
export { EloSystem };
