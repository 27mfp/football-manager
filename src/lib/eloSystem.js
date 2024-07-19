class EloSystem {
  constructor(config = {}) {
    this.config = {
      kFactor: config.kFactor || 50, // The K-factor determines the magnitude of Elo rating changes
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

  calculateNewRating(playerRating, opponentRating, actualScore) {
    // Calculates the new Elo rating for a player after a match
    const expectedScore = this.calculateExpectedScore(
      playerRating,
      opponentRating
    );

    // Calculates the new rating using the Elo formula
    return Math.round(
      playerRating + this.config.kFactor * (actualScore - expectedScore)
    );
  }

  calculateTeamAverageRating(team) {
    // Calculates the average rating of a team
    return team.reduce((sum, player) => sum + player.elo, 0) / team.length;
  }

  updateMatchRatings(team1, team2, score1, score2) {
    // Updates the Elo ratings of players in both teams after a match
    const team1AvgRating = this.calculateTeamAverageRating(team1);
    const team2AvgRating = this.calculateTeamAverageRating(team2);

    const updateTeam = (team, opponentAvgRating, result) => {
      // Updates the Elo ratings of players in a team
      return team.map((player) => {
        let actualScore;
        if (result === "win") actualScore = 1;
        else if (result === "loss") actualScore = 0;
        else actualScore = 0.5; // draw

        const newRating = this.calculateNewRating(
          player.elo,
          opponentAvgRating,
          actualScore
        );

        return {
          ...player,
          elo: newRating,
          matches: player.matches + 1,
          wins: player.wins + (result === "win" ? 1 : 0),
        };
      });
    };

    // Determine the match result
    let team1Result, team2Result;
    if (score1 > score2) {
      team1Result = "win";
      team2Result = "loss";
    } else if (score1 < score2) {
      team1Result = "loss";
      team2Result = "win";
    } else {
      team1Result = team2Result = "draw";
    }

    // Updates the Elo ratings of players in both teams
    const updatedTeam1 = updateTeam(team1, team2AvgRating, team1Result);
    const updatedTeam2 = updateTeam(team2, team1AvgRating, team2Result);

    return [updatedTeam1, updatedTeam2];
  }
}

const eloSystem = new EloSystem({
  kFactor: 50, // Default K-factor value
});

export default eloSystem;
export { EloSystem };
