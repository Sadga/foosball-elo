import type { Match, Team, Player, MatchWithTeamsAndPlayers } from '../db/types';

export type EloOptions = {
  maxPoints: number;
}

export function calcEloDeltas (match: MatchWithTeamsAndPlayers, opt: EloOptions = { maxPoints: 10 }) {
  const P = pFactor(match, opt.maxPoints);

  const expected = {
    team1: {
      front: {
        front: (
          1 / (1 + 10 ** ((Number(match.team2.front.eloFront) - Number(match.team1.front.eloFront)) / 500)) +
          1 / (1 + 10 ** ((Number(match.team2.back.eloBack) - Number(match.team1.front.eloFront)) / 500))
        ) / 2,
        total: (
          1 / (1 + 10 ** ((Number(match.team2.front.eloFront) - Number(match.team1.front.eloTotal)) / 500)) +
          1 / (1 + 10 ** ((Number(match.team2.back.eloBack) - Number(match.team1.front.eloTotal)) / 500))
        ) / 2
      },
      back: {
        back: (
          1 / (1 + 10 ** ((Number(match.team2.front.eloFront) - Number(match.team1.back.eloBack)) / 500)) +
          1 / (1 + 10 ** ((Number(match.team2.back.eloBack) - Number(match.team1.back.eloBack)) / 500))
        ) / 2,
        total: (
          1 / (1 + 10 ** ((Number(match.team2.front.eloFront) - Number(match.team1.back.eloTotal)) / 500)) +
          1 / (1 + 10 ** ((Number(match.team2.back.eloBack) - Number(match.team1.back.eloTotal)) / 500))
        ) / 2
      },
      total: 0
    },
    team2: {
      front: {
        front: (
          1 / (1 + 10 ** ((Number(match.team1.front.eloFront) - Number(match.team2.front.eloFront)) / 500)) +
          1 / (1 + 10 ** ((Number(match.team1.back.eloBack) - Number(match.team2.front.eloFront)) / 500))
        ) / 2,
        total: (
          1 / (1 + 10 ** ((Number(match.team1.front.eloFront) - Number(match.team2.front.eloTotal)) / 500)) +
          1 / (1 + 10 ** ((Number(match.team1.back.eloBack) - Number(match.team2.front.eloTotal)) / 500))
        ) / 2
      },
      back: {
        back: (
          1 / (1 + 10 ** ((Number(match.team1.front.eloFront) - Number(match.team2.back.eloBack)) / 500)) +
          1 / (1 + 10 ** ((Number(match.team1.back.eloBack) - Number(match.team2.back.eloBack)) / 500))
        ) / 2,
        total: (
          1 / (1 + 10 ** ((Number(match.team1.front.eloFront) - Number(match.team2.back.eloTotal)) / 500)) +
          1 / (1 + 10 ** ((Number(match.team1.back.eloBack) - Number(match.team2.back.eloTotal)) / 500))
        ) / 2
      },
      total: 0
    }
  };

  expected.team1.total = (expected.team1.front.front + expected.team1.back.back) / 2;
  expected.team2.total = (expected.team2.front.front + expected.team2.back.back) / 2;

  const outcome = {
    team1: match.score1 > match.score2 ? 1 : 0,
    team2: match.score2 > match.score1 ? 1 : 0
  };

  return {
    players: {
      [match.team1.front.id]: kFactor(match.team1.front) * P * (outcome.team1 - ((expected.team1.front.front + expected.team1.total) / 2)),
      [match.team1.back.id]: kFactor(match.team1.back) * P * (outcome.team1 - ((expected.team1.back.back + expected.team1.total) / 2)),
      [match.team2.front.id]: kFactor(match.team2.front) * P * (outcome.team2 - ((expected.team2.front.front + expected.team2.total) / 2)),
      [match.team2.back.id]: kFactor(match.team2.back) * P * (outcome.team2 - ((expected.team2.back.back + expected.team2.total) / 2))
    },
    teams: {
      [match.team1.id]: kFactor(match.team1) * P * (outcome.team1 - expected.team1.total),
      [match.team2.id]: kFactor(match.team2) * P * (outcome.team2 - expected.team2.total)
    }
  };

  // return {
  //   players: {
  //     [match.team1.front.id]: kFactor(match.team1.front) * P * (outcome.team1 - expected.team1.front.front),
  //     [match.team1.back.id]: kFactor(match.team1.back) * P * (outcome.team1 - expected.team1.back.back),
  //     [match.team2.front.id]: kFactor(match.team2.front) * P * (outcome.team2 - expected.team2.front.front),
  //     [match.team2.back.id]: kFactor(match.team2.back) * P * (outcome.team2 - expected.team2.back.back)
  //   },
  //   teams: {
  //     [match.team1.id]: kFactor(match.team1) * P * (outcome.team1 - expected.team1.total),
  //     [match.team2.id]: kFactor(match.team2) * P * (outcome.team2 - expected.team2.total)
  //   }
  // };
}

export function kFactor (player: Player | Team) {
  return 50 / (1 + Number(player.matchesPlayed) / 300);
}

export function pFactor (match: Match, maxPoints: number = 10) {
  return 2 + log(maxPoints, Math.abs(Number(match.score1) - Number(match.score2)) + 1) ** 3;
}

export function log (x: number, base: number = 10) {
  return Math.log(base) / Math.log(x);
}
