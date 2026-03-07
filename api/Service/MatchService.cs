using Dartz.Business.Interfaces;
using Dartz.Model;
using Dartz.Model.DTO;
using Dartz.Service.Interfaces;

namespace Dartz.Service
{
    public class MatchService : IMatchService
    {
        private readonly IMatchRepository _matchRepository;

        public MatchService(IMatchRepository matchRepository)
        {
            _matchRepository = matchRepository;
        }

        /// <summary>
        /// Processes a match submission from the frontend:
        /// 1. Maps the DTO to entities (Match, MatchPlayers, Legs, Turns, Darts)
        /// 2. Reconstructs leg boundaries from throw data
        /// 3. Inserts everything to the database
        /// 4. Updates precomputed PlayerStats for each participant
        /// </summary>
        public async Task<Match> SubmitMatch(MatchSubmissionDto submission)
        {
            var match = new Match
            {
                GameModeKey = submission.GameModeKey,
                Sets = submission.Sets,
                Legs = submission.Legs,
                WinnerPlayerID = submission.WinnerPlayerId,
                StartedAt = submission.StartedAt.ToUniversalTime(),
                FinishedAt = submission.FinishedAt.ToUniversalTime(),
            };

            // Create MatchPlayer entities
            var matchPlayers = new Dictionary<int, MatchPlayer>(); // playerId -> MatchPlayer
            foreach (var playerDto in submission.Players)
            {
                var matchPlayer = new MatchPlayer
                {
                    Match = match,
                    PlayerID = playerDto.PlayerId,
                    PlayerIndex = playerDto.PlayerIndex,
                    FinalSets = playerDto.FinalSets,
                    FinalLegs = playerDto.FinalLegs,
                };
                matchPlayers[playerDto.PlayerId] = matchPlayer;
                match.MatchPlayers.Add(matchPlayer);
            }

            // Reconstruct legs and turns from the flat throw arrays.
            // In 501, a leg ends when a player's score reaches 0.
            // We interleave throws across players based on their PlayerIndex (turn order).
            ReconstructLegsAndTurns(match, submission, matchPlayers);

            // Save to database
            var savedMatch = await _matchRepository.AddMatch(match);

            // Update precomputed stats for each player
            await UpdatePlayerStats(match, submission, matchPlayers);

            return savedMatch;
        }

        public async Task<List<MatchHistoryDto>> GetMatchHistory(int playerId, int page, int pageSize)
        {
            var matches = await _matchRepository.GetMatchesByPlayer(playerId, page, pageSize);

            return matches.Select(m => new MatchHistoryDto
            {
                MatchId = m.ID,
                GameModeKey = m.GameModeKey,
                FinishedAt = m.FinishedAt,
                WinnerUsername = m.WinnerPlayer?.Username ?? "Unknown",
                WinnerPlayerId = m.WinnerPlayerID ?? 0,
                Sets = m.Sets,
                Legs = m.Legs,
                Players = m.MatchPlayers.Select(mp =>
                {
                    var totalPoints = mp.Turns.Sum(t => t.TotalPoints);
                    var turnCount = mp.Turns.Count;
                    return new MatchHistoryPlayerDto
                    {
                        PlayerId = mp.PlayerID,
                        Username = mp.Player.Username,
                        Initial = mp.Player.Initial,
                        FinalSets = mp.FinalSets,
                        FinalLegs = mp.FinalLegs,
                        Average = turnCount > 0 ? Math.Round((double)totalPoints / turnCount, 2) : 0,
                    };
                }).ToList(),
            }).ToList();
        }

        public async Task<MatchDetailDto?> GetMatchDetail(int matchId)
        {
            var match = await _matchRepository.GetMatchDetail(matchId);
            if (match == null) return null;

            return new MatchDetailDto
            {
                MatchId = match.ID,
                GameModeKey = match.GameModeKey,
                Sets = match.Sets,
                Legs = match.Legs,
                StartedAt = match.StartedAt,
                FinishedAt = match.FinishedAt,
                WinnerPlayerId = match.WinnerPlayerID ?? 0,
                WinnerUsername = match.WinnerPlayer?.Username ?? "Unknown",
                Players = match.MatchPlayers.OrderBy(mp => mp.PlayerIndex).Select(mp => new MatchDetailPlayerDto
                {
                    PlayerId = mp.PlayerID,
                    Username = mp.Player.Username,
                    Initial = mp.Player.Initial,
                    PlayerIndex = mp.PlayerIndex,
                    FinalSets = mp.FinalSets,
                    FinalLegs = mp.FinalLegs,
                }).ToList(),
                MatchLegs = match.MatchLegs.OrderBy(l => l.LegNumber).Select(l => new MatchDetailLegDto
                {
                    LegNumber = l.LegNumber,
                    WinnerPlayerId = l.WinnerPlayerID,
                    Turns = l.Turns.OrderBy(t => t.TurnNumber).Select(t => new MatchDetailTurnDto
                    {
                        TurnNumber = t.TurnNumber,
                        PlayerId = t.MatchPlayer.PlayerID,
                        Username = t.MatchPlayer.Player.Username,
                        ScoreBefore = t.ScoreBefore,
                        ScoreAfter = t.ScoreAfter,
                        TotalPoints = t.TotalPoints,
                        IsBust = t.IsBust,
                        Darts = t.Darts.OrderBy(d => d.DartNumber).Select(d => new MatchDetailDartDto
                        {
                            DartNumber = d.DartNumber,
                            BaseScore = d.BaseScore,
                            Multiplier = d.Multiplier,
                        }).ToList(),
                    }).ToList(),
                }).ToList(),
            };
        }

        public async Task<PlayerStatsDto?> GetPlayerStats(int playerId)
        {
            var stats = await _matchRepository.GetPlayerStats(playerId);
            if (stats == null) return null;

            return new PlayerStatsDto
            {
                PlayerId = stats.PlayerID,
                Username = stats.Player.Username,
                TotalMatches = stats.TotalMatches,
                TotalWins = stats.TotalWins,
                WinRate = stats.TotalMatches > 0 ? Math.Round((double)stats.TotalWins / stats.TotalMatches * 100, 1) : 0,
                TotalLegs = stats.TotalLegs,
                TotalLegsWon = stats.TotalLegsWon,
                OverallAverage = Math.Round(stats.OverallAverage, 2),
                TotalDarts = stats.TotalDarts,
                HighestTurnScore = stats.HighestTurnScore,
                Count100Plus = stats.Count100Plus,
                Count140Plus = stats.Count140Plus,
                Count180s = stats.Count180s,
                TotalBusts = stats.TotalBusts,
                TotalCheckoutAttempts = stats.TotalCheckoutAttempts,
                TotalCheckouts = stats.TotalCheckouts,
                CheckoutRate = stats.TotalCheckoutAttempts > 0
                    ? Math.Round((double)stats.TotalCheckouts / stats.TotalCheckoutAttempts * 100, 1) : 0,
                HighestCheckout = stats.HighestCheckout,
                BestLegDarts = stats.BestLegDarts,
                BestMatchAverage = Math.Round(stats.BestMatchAverage, 2),
                WorstMatchAverage = Math.Round(stats.WorstMatchAverage, 2),
                CurrentWinStreak = stats.CurrentWinStreak,
                LongestWinStreak = stats.LongestWinStreak,
                First9Average = Math.Round(stats.First9Average, 2),
                DartsPerLeg = stats.TotalLegsWon > 0
                    ? Math.Round((double)stats.TotalDarts / stats.TotalLegsWon, 1) : 0,
                LastPlayedAt = stats.LastPlayedAt,
            };
        }
        public async Task<List<OpponentStatsDto>> GetOpponentStats(int playerId)
        {
            var matches = await _matchRepository.GetMatchesWithOpponents(playerId);

            // Group by opponent
            var opponentMap = new Dictionary<int, OpponentStatsDto>();

            foreach (var match in matches)
            {
                var opponents = match.MatchPlayers
                    .Where(mp => mp.PlayerID != playerId)
                    .ToList();

                bool playerWon = match.WinnerPlayerID == playerId;

                foreach (var opp in opponents)
                {
                    if (!opponentMap.ContainsKey(opp.PlayerID))
                    {
                        opponentMap[opp.PlayerID] = new OpponentStatsDto
                        {
                            OpponentPlayerId = opp.PlayerID,
                            OpponentUsername = opp.Player.Username,
                            OpponentInitial = opp.Player.Initial,
                        };
                    }

                    var stats = opponentMap[opp.PlayerID];
                    stats.MatchesPlayed++;
                    if (playerWon) stats.Wins++;
                    else stats.Losses++;

                    if (stats.LastPlayedAt == null || match.FinishedAt > stats.LastPlayedAt)
                        stats.LastPlayedAt = match.FinishedAt;
                }
            }

            // Calculate win rates and sort
            foreach (var stats in opponentMap.Values)
            {
                stats.WinRate = stats.MatchesPlayed > 0
                    ? Math.Round((double)stats.Wins / stats.MatchesPlayed * 100, 1)
                    : 0;
            }

            return opponentMap.Values
                .OrderByDescending(o => o.MatchesPlayed)
                .ThenByDescending(o => o.WinRate)
                .ToList();
        }

        /// <summary>
        /// Reconstructs the leg/turn/dart structure from flat throw arrays.
        /// 
        /// The frontend stores throws as a flat array per player, interleaved by turn order.
        /// In 501, a leg boundary is detected when ScoreAfter == 0 (or when throws are
        /// empty/bust because the score went below 0).
        ///
        /// We simulate the game by replaying throws in turn order across players.
        /// </summary>
        private void ReconstructLegsAndTurns(Match match, MatchSubmissionDto submission, Dictionary<int, MatchPlayer> matchPlayers)
        {
            // Sort players by their index (turn order)
            var sortedPlayers = submission.Players.OrderBy(p => p.PlayerIndex).ToList();
            int playerCount = sortedPlayers.Count;
            int startingScore = GetStartingScore(submission.GameModeKey);

            // Track throw indices per player
            var throwIndices = new Dictionary<int, int>();
            foreach (var p in sortedPlayers)
                throwIndices[p.PlayerId] = 0;

            int legNumber = 1;
            bool hasMoreThrows = true;

            while (hasMoreThrows)
            {
                var leg = new Leg
                {
                    Match = match,
                    LegNumber = legNumber,
                };

                // Track scores per player for this leg
                var scores = new Dictionary<int, int>();
                foreach (var p in sortedPlayers)
                    scores[p.PlayerId] = startingScore;

                int turnNumber = 1;
                bool legComplete = false;

                while (!legComplete)
                {
                    bool anyThrowInRound = false;

                    for (int i = 0; i < playerCount; i++)
                    {
                        var playerDto = sortedPlayers[i];
                        int idx = throwIndices[playerDto.PlayerId];

                        if (idx >= playerDto.Throws.Count)
                            continue;

                        anyThrowInRound = true;
                        var throwDto = playerDto.Throws[idx];
                        throwIndices[playerDto.PlayerId] = idx + 1;

                        int totalPoints =
                            throwDto.Score1 * throwDto.Multiplier1 +
                            throwDto.Score2 * throwDto.Multiplier2 +
                            throwDto.Score3 * throwDto.Multiplier3;

                        int scoreBefore = scores[playerDto.PlayerId];
                        int scoreAfter = scoreBefore - totalPoints;
                        bool isBust = scoreAfter < 0 || scoreAfter == 1;

                        if (isBust)
                        {
                            // Bust: score stays the same, and the throw was empty/invalid
                            scoreAfter = scoreBefore;
                            totalPoints = 0;
                        }

                        scores[playerDto.PlayerId] = scoreAfter;

                        var matchPlayer = matchPlayers[playerDto.PlayerId];
                        var turn = new Turn
                        {
                            Leg = leg,
                            MatchPlayer = matchPlayer,
                            TurnNumber = turnNumber,
                            ScoreBefore = scoreBefore,
                            ScoreAfter = scoreAfter,
                            TotalPoints = totalPoints,
                            IsBust = isBust,
                        };

                        // Create individual dart records
                        turn.Darts.Add(new Dart { Turn = turn, DartNumber = 1, BaseScore = throwDto.Score1, Multiplier = throwDto.Multiplier1 });
                        turn.Darts.Add(new Dart { Turn = turn, DartNumber = 2, BaseScore = throwDto.Score2, Multiplier = throwDto.Multiplier2 });
                        turn.Darts.Add(new Dart { Turn = turn, DartNumber = 3, BaseScore = throwDto.Score3, Multiplier = throwDto.Multiplier3 });

                        leg.Turns.Add(turn);

                        // Check if this player won the leg
                        if (scoreAfter == 0)
                        {
                            leg.WinnerPlayerID = playerDto.PlayerId;
                            legComplete = true;
                            break;
                        }
                    }

                    if (!anyThrowInRound)
                    {
                        legComplete = true; // No more throws available
                    }

                    turnNumber++;
                }

                match.MatchLegs.Add(leg);
                legNumber++;

                // Check if any player still has throws remaining
                hasMoreThrows = sortedPlayers.Any(p => throwIndices[p.PlayerId] < p.Throws.Count);
            }
        }

        /// <summary>
        /// Returns the starting score for a given game mode.
        /// </summary>
        private int GetStartingScore(string gameModeKey)
        {
            return gameModeKey switch
            {
                "501" => 501,
                "301" => 301,
                _ => 501, // Default to 501
            };
        }

        /// <summary>
        /// Returns match counts per date for the GitHub-style activity heatmap.
        /// </summary>
        public async Task<List<ActivityDayDto>> GetActivityData(int playerId)
        {
            var matches = await _matchRepository.GetMatchesWithOpponents(playerId);

            return matches
                .GroupBy(m => m.FinishedAt.Date)
                .Select(g => new ActivityDayDto
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Count = g.Count(),
                })
                .OrderBy(d => d.Date)
                .ToList();
        }

        /// <summary>
        /// Returns per-match averages in chronological order for trend chart.
        /// </summary>
        public async Task<List<MatchTrendPointDto>> GetMatchTrends(int playerId)
        {
            var matches = await _matchRepository.GetMatchesByPlayer(playerId, 1, 100);

            return matches
                .OrderBy(m => m.FinishedAt)
                .Select(m =>
                {
                    var mp = m.MatchPlayers.FirstOrDefault(p => p.PlayerID == playerId);
                    var totalPoints = mp?.Turns.Sum(t => t.TotalPoints) ?? 0;
                    var turnCount = mp?.Turns.Count ?? 0;
                    return new MatchTrendPointDto
                    {
                        MatchId = m.ID,
                        Date = m.FinishedAt,
                        Average = turnCount > 0 ? Math.Round((double)totalPoints / turnCount, 2) : 0,
                        Won = m.WinnerPlayerID == playerId,
                    };
                })
                .ToList();
        }

        /// <summary>
        /// Updates the precomputed PlayerStats for all match participants.
        /// </summary>
        private async Task UpdatePlayerStats(Match match, MatchSubmissionDto submission, Dictionary<int, MatchPlayer> matchPlayers)
        {
            foreach (var playerDto in submission.Players)
            {
                var existingStats = await _matchRepository.GetPlayerStats(playerDto.PlayerId);
                var stats = existingStats ?? new PlayerStats
                {
                    PlayerID = playerDto.PlayerId,
                    WorstMatchAverage = double.MaxValue,
                };

                bool isWinner = match.WinnerPlayerID == playerDto.PlayerId;

                // ── Per-throw stats ──
                int matchTurns = 0;
                int matchPoints = 0;
                int matchHighest = 0;
                int match100Plus = 0;
                int match140Plus = 0;
                int match180s = 0;

                foreach (var throwDto in playerDto.Throws)
                {
                    int turnTotal =
                        throwDto.Score1 * throwDto.Multiplier1 +
                        throwDto.Score2 * throwDto.Multiplier2 +
                        throwDto.Score3 * throwDto.Multiplier3;

                    matchTurns++;
                    matchPoints += turnTotal;
                    if (turnTotal > matchHighest) matchHighest = turnTotal;
                    if (turnTotal >= 100) match100Plus++;
                    if (turnTotal >= 140) match140Plus++;
                    if (turnTotal == 180) match180s++;
                }

                int matchDarts = matchTurns * 3;

                // ── First 9 (first 3 turns per leg) ──
                int first9Turns = 0;
                int first9Points = 0;
                var mp = matchPlayers[playerDto.PlayerId];
                foreach (var leg in match.MatchLegs)
                {
                    var playerTurnsInLeg = leg.Turns
                        .Where(t => t.MatchPlayer == mp)
                        .OrderBy(t => t.TurnNumber)
                        .Take(3)
                        .ToList();
                    first9Turns += playerTurnsInLeg.Count;
                    first9Points += playerTurnsInLeg.Sum(t => t.TotalPoints);
                }

                // ── Checkout & bust stats from reconstructed turns ──
                int matchBusts = 0;
                int matchCheckoutAttempts = 0;
                int matchCheckouts = 0;
                int matchHighestCheckout = 0;

                foreach (var leg in match.MatchLegs)
                {
                    foreach (var turn in leg.Turns.Where(t => t.MatchPlayer == mp))
                    {
                        if (turn.IsBust) matchBusts++;

                        // Checkout attempt: score was reachable (≤ 170)
                        if (turn.ScoreBefore <= 170)
                        {
                            matchCheckoutAttempts++;

                            if (turn.ScoreAfter == 0)
                            {
                                matchCheckouts++;
                                if (turn.TotalPoints > matchHighestCheckout)
                                    matchHighestCheckout = turn.TotalPoints;
                            }
                        }
                    }
                }

                // ── Best leg darts ──
                int? bestLegDartsThisMatch = null;
                foreach (var leg in match.MatchLegs)
                {
                    if (leg.WinnerPlayerID == playerDto.PlayerId)
                    {
                        int turnsInLeg = leg.Turns.Count(t => t.MatchPlayer == mp);
                        int dartsInLeg = turnsInLeg * 3;
                        if (bestLegDartsThisMatch == null || dartsInLeg < bestLegDartsThisMatch)
                            bestLegDartsThisMatch = dartsInLeg;
                    }
                }

                // ── Legs ──
                int legsPlayed = match.MatchLegs.Count;
                int legsWon = match.MatchLegs.Count(l => l.WinnerPlayerID == playerDto.PlayerId);

                // ── Match average for best/worst records ──
                double matchAverage = matchTurns > 0 ? (double)matchPoints / matchTurns : 0;

                // ── Update aggregate stats ──
                stats.TotalMatches++;
                stats.TotalWins += isWinner ? 1 : 0;
                stats.TotalLegs += legsPlayed;
                stats.TotalLegsWon += legsWon;
                stats.TotalTurns += matchTurns;
                stats.TotalPoints += matchPoints;
                stats.TotalDarts += matchDarts;
                stats.OverallAverage = stats.TotalTurns > 0 ? (double)stats.TotalPoints / stats.TotalTurns : 0;
                stats.HighestTurnScore = Math.Max(stats.HighestTurnScore, matchHighest);
                stats.Count100Plus += match100Plus;
                stats.Count140Plus += match140Plus;
                stats.Count180s += match180s;

                // Busts
                stats.TotalBusts += matchBusts;

                // Checkouts
                stats.TotalCheckoutAttempts += matchCheckoutAttempts;
                stats.TotalCheckouts += matchCheckouts;
                stats.HighestCheckout = Math.Max(stats.HighestCheckout, matchHighestCheckout);

                // Best leg darts
                if (bestLegDartsThisMatch.HasValue)
                {
                    stats.BestLegDarts = stats.BestLegDarts.HasValue
                        ? Math.Min(stats.BestLegDarts.Value, bestLegDartsThisMatch.Value)
                        : bestLegDartsThisMatch.Value;
                }

                // Best/Worst match average
                if (matchTurns > 0)
                {
                    stats.BestMatchAverage = Math.Max(stats.BestMatchAverage, matchAverage);
                    stats.WorstMatchAverage = Math.Min(stats.WorstMatchAverage, matchAverage);
                }

                // Win streaks
                if (isWinner)
                {
                    stats.CurrentWinStreak++;
                    stats.LongestWinStreak = Math.Max(stats.LongestWinStreak, stats.CurrentWinStreak);
                }
                else
                {
                    stats.CurrentWinStreak = 0;
                }

                // First 9 average
                stats.TotalFirst9Turns += first9Turns;
                stats.TotalFirst9Points += first9Points;
                stats.First9Average = stats.TotalFirst9Turns > 0
                    ? (double)stats.TotalFirst9Points / stats.TotalFirst9Turns : 0;

                stats.LastPlayedAt = DateTime.UtcNow;

                await _matchRepository.UpsertPlayerStats(stats);
            }
        }
    }
}
