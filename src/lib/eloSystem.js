class EloSystem {
  constructor(config = {}) {
    this.config = {
      kFactor: config.kFactor || 50, // The K-factor determines the magnitude of Elo rating changes
      maxGoalDifference: config.maxGoalDifference || 3, // The maximum allowed goal difference in a match
    };
  }

  calculateExpectedScore(playerRating, opponentRating) {
    // Calculates the expected score of a player based on their rating and the opponent's rating
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  }

  calculatePotentialEloChanges(teamARating, teamBRating) {
    // Calculates the potential Elo changes for both teams in a match
    const expectedScoreA = this.calculateExpectedScore(
      teamARating,
      teamBRating
    );

    // Calculates the Elo changes for team A if they win or lose
    const teamAWinChange = Math.round(
      this.config.kFactor * (1 - expectedScoreA)
    );
    const teamALoseChange = Math.round(
      this.config.kFactor * (0 - expectedScoreA)
    );

    // Calculates the Elo changes for team B if they win or lose
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
    playerRating,
    opponentRating,
    actualScore,
    goalDifference
  ) {
    // Calculates the new Elo rating for a player after a match
    const expectedScore = this.calculateExpectedScore(
      playerRating,
      opponentRating
    );

    // Calculates the score factor based on the goal difference
    const scoreFactor =
      Math.min(Math.abs(goalDifference), this.config.maxGoalDifference) /
      this.config.maxGoalDifference;

    // Calculates the new rating using the Elo formula
    return Math.round(
      playerRating +
        this.config.kFactor * scoreFactor * (actualScore - expectedScore)
    );
  }

  calculateTeamAverageRating(team) {
    // Calculates the average rating of a team
    return team.reduce((sum, player) => sum + player.elo, 0) / team.length;
  }

  updateMatchRatings(team1, team2, score1, score2) {
    // Updates the Elo ratings of players in both teams after a match
    const goalDifference = score1 - score2;
    const team1AvgRating = this.calculateTeamAverageRating(team1);
    const team2AvgRating = this.calculateTeamAverageRating(team2);

    const updateTeam = (team, opponentAvgRating, won) => {
      // Updates the Elo ratings of players in a team
      return team.map((player) => {
        const actualScore = won ? 1 : goalDifference === 0 ? 0.5 : 0;
        const newRating = this.calculateNewRating(
          player.elo,
          opponentAvgRating,
          actualScore,
          goalDifference
        );

        return {
          ...player,
          elo: newRating,
          matches: player.matches + 1,
          wins: player.wins + (won ? 1 : 0),
        };
      });
    };

    // Updates the Elo ratings of players in both teams
    const updatedTeam1 = updateTeam(team1, team2AvgRating, goalDifference > 0);
    const updatedTeam2 = updateTeam(team2, team1AvgRating, goalDifference < 0);

    return [updatedTeam1, updatedTeam2];
  }
}

const eloSystem = new EloSystem({
  kFactor: 50, // Default K-factor value
  maxGoalDifference: 3, // Default maximum goal difference value
});

export default eloSystem;
export { EloSystem };
