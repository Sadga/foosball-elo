import { PrismaClient } from '@prisma/client';
import { calcEloDeltas } from '../libs/elo';
import type {
  User,
  League,
  NewMatch,
  MatchWithTeamsAndPlayersAndUsers,
  PlayerWithUser,
  TeamWithPlayersAndUsers
} from './types';

export const prisma = new PrismaClient();

export async function cleanup () {
  await prisma.$disconnect();
}

export async function getUserByName (name: string) {
  return await prisma.user.findFirst({ where: { name } });
}

export async function getUser (userId: string) {
  return await prisma.user.findFirst({ where: { id: userId } });
}

export async function saveUser (user: User, userId: string) {
  if (user.id !== userId) { throw new Error('Invalid user id'); }

  return await prisma.user.update({ where: { id: user.id }, data: user });
}

export async function createLeague (league: League, userId: string) {
  const newLeague = await prisma.league.create({ data: league });
  await prisma.player.create({ data: { userId, leagueId: newLeague.id } });
  return newLeague;
}

export async function saveLeague (league: League) {
  return await prisma.league.update({ where: { id: league.id }, data: league });
}

export async function getUserLeagues (userId: string) {
  const players = await prisma.player.findMany({ where: { userId }, include: { league: true } });

  return await players.map((player) => player.league);
}

export async function getLeagueMatches (leagueId: string): Promise<MatchWithTeamsAndPlayersAndUsers[]> {
  return await prisma.match.findMany({
    where: { leagueId },
    orderBy: { date: 'asc' },
    include: {
      team1: {
        include: {
          back: { include: { user: true } },
          front: { include: { user: true } }
        }
      },
      team2: {
        include: {
          back: { include: { user: true } },
          front: { include: { user: true } }
        }
      }
    }
  });
}

export async function createMatch (leagueId: string, match: NewMatch, userId: string): Promise<MatchWithTeamsAndPlayersAndUsers> {
  const league = await prisma.league.findFirst({ where: { id: leagueId } });
  if (!league) { throw new Error('League not found'); }

  let team1 = await prisma.team.findFirst({ where: { leagueId: league.id, backId: match.team1.backId, frontId: match.team1.frontId } });
  if (!team1) {
    team1 = await prisma.team.create({ data: { leagueId: league.id, backId: match.team1.backId, frontId: match.team1.frontId } });
  }

  let team2 = await prisma.team.findFirst({ where: { leagueId: league.id, backId: match.team2.backId, frontId: match.team2.frontId } });
  if (!team2) {
    team2 = await prisma.team.create({ data: { leagueId: league.id, backId: match.team2.backId, frontId: match.team2.frontId } });
  }

  const matchEntity = await prisma.match.create({
    data: {
      leagueId: league.id,
      team1Id: team1.id,
      score1: match.team1.score,
      team2Id: team2.id,
      score2: match.team2.score,
      createdById: userId
    },
    include: {
      team1: {
        include: {
          back: { include: { user: true } },
          front: { include: { user: true } }
        }
      },
      team2: {
        include: {
          back: { include: { user: true } },
          front: { include: { user: true } }
        }
      }
    }
  });

  const eloDeltas = calcEloDeltas(matchEntity, { maxPoints: league.maxPoints });

  await Promise.all([
    prisma.player.update({
      where: { id: matchEntity.team1.front.id },
      data: {
        matchesPlayed: { increment: 1 },
        eloFront: { increment: eloDeltas.players[matchEntity.team1.front.id] },
        eloTotal: { increment: eloDeltas.players[matchEntity.team1.front.id] }
      }
    }),
    prisma.player.update({
      where: { id: matchEntity.team1.back.id },
      data: {
        matchesPlayed: { increment: 1 },
        eloBack: { increment: eloDeltas.players[matchEntity.team1.back.id] },
        eloTotal: { increment: eloDeltas.players[matchEntity.team1.back.id] }
      }
    }),
    prisma.player.update({
      where: { id: matchEntity.team2.front.id },
      data: {
        matchesPlayed: { increment: 1 },
        eloFront: { increment: eloDeltas.players[matchEntity.team2.front.id] },
        eloTotal: { increment: eloDeltas.players[matchEntity.team2.front.id] }
      }
    }),
    prisma.player.update({
      where: { id: matchEntity.team2.back.id },
      data: {
        matchesPlayed: { increment: 1 },
        eloBack: { increment: eloDeltas.players[matchEntity.team2.back.id] },
        eloTotal: { increment: eloDeltas.players[matchEntity.team2.back.id] }
      }
    }),
    prisma.team.update({ where: { id: team1.id }, data: { eloTotal: { increment: eloDeltas.teams[team1.id] } } }),
    prisma.team.update({ where: { id: team2.id }, data: { eloTotal: { increment: eloDeltas.teams[team2.id] } } })
  ]);

  return matchEntity;
}

export async function getLeaguePlayers (leagueId: string): Promise<PlayerWithUser[]> {
  return await prisma.player.findMany({
    where: { leagueId },
    orderBy: { user: { name: 'asc' } },
    include: { user: true }
  });
}

export async function getLeagueTeams (leagueId: string): Promise<TeamWithPlayersAndUsers[]> {
  return await prisma.team.findMany({
    where: { leagueId },
    orderBy: { eloTotal: 'desc' },
    include: {
      back: { include: { user: true } },
      front: { include: { user: true } }
    }
  });
}
