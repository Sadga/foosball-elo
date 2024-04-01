import { PrismaClient } from '@prisma/client';
import { BASE_ELO, calcEloDeltas } from '../libs/elo';
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

export async function getUser (userId: string, sessionUserId: string) {
  if (userId !== sessionUserId) { throw new Error('invalidUserId'); }

  return await prisma.user.findFirst({ where: { id: userId } });
}

export async function saveUser (user: User, sessionUserId: string) {
  if (user.id !== sessionUserId) { throw new Error('invalidUserId'); }

  return await prisma.user.update({ where: { id: user.id }, data: user });
}

export async function getLeague (leagueId: string, sessionUserId: string) {
  const league = await prisma.league.findFirst({ where: { id: leagueId } });

  return league;
}

export async function createLeague (league: League, sessionUserId: string) {
  const newLeague = await prisma.league.create({ data: league });
  await prisma.player.create({ data: { userId: sessionUserId, leagueId: newLeague.id, admin: true } });

  return newLeague;
}

export async function saveLeague (league: League, sessionUserId: string) {
  if (!league.id) { throw new Error('invalidLeague'); }

  const player = await prisma.player.findFirst({ where: { userId: sessionUserId, leagueId: league.id } });
  if (!player?.admin) { throw new Error('cannotSaveLeague'); }

  return await prisma.league.update({ where: { id: league.id }, data: league });
}

export async function deleteLeague (leagueId: string, sessionUserId: string) {
  const player = await prisma.player.findFirst({ where: { userId: sessionUserId, leagueId } });
  if (!player?.admin) { throw new Error('cannotDeleteLeague'); }

  return await prisma.league.delete({ where: { id: player.leagueId } });
}

export async function joinLeague (leagueId: string, sessionUserId: string) {
  const league = await prisma.league.findFirst({ where: { id: leagueId } });
  if (!league) { throw new Error('leagueNotFound'); }

  const player = await prisma.player.findFirst({ where: { userId: sessionUserId, leagueId: league.id } });
  if (player && player.banned) {
    throw new Error('playerAlreadyInLeague');
  } else if (player) {
    return player;
  }

  return await prisma.player.create({ data: { userId: sessionUserId, leagueId: league.id, eloBack: BASE_ELO, eloFront: BASE_ELO, eloTotal: BASE_ELO, matchesPlayed: 0 } });
}

export async function banPlayer (playerId: string, sessionUserId: string) {
  const banPlayer = await prisma.player.findFirst({ where: { id: playerId } });
  if (!banPlayer) { throw new Error('playerNotFound'); }

  const player = await prisma.player.findFirst({ where: { userId: sessionUserId, leagueId: banPlayer.leagueId } });
  if (!player?.admin) { throw new Error('cannotBanPlayer'); }

  return await prisma.player.update({ where: { id: banPlayer.id }, data: { banned: true, admin: false } });
}

export async function unbanPlayer (playerId: string, sessionUserId: string) {
  const unbanPlayer = await prisma.player.findFirst({ where: { id: playerId } });
  if (!unbanPlayer) { throw new Error('playerNotFound'); }

  const player = await prisma.player.findFirst({ where: { userId: sessionUserId, leagueId: unbanPlayer.leagueId } });
  if (!player?.admin) { throw new Error('cannotUnbanPlayer'); }

  return await prisma.player.update({ where: { id: unbanPlayer.id }, data: { banned: false } });
}

export async function addAdminPlayer (playerId: string, sessionUserId: string) {
  const adminPlayer = await prisma.player.findFirst({ where: { id: playerId } });
  if (!adminPlayer) { throw new Error('playerNotFound'); }
  if (adminPlayer.banned) { throw new Error('cannotAddABannedPlayerToAdmins'); }

  const player = await prisma.player.findFirst({ where: { userId: sessionUserId, leagueId: adminPlayer.leagueId } });
  if (!player?.admin) { throw new Error('cannotAddAdminPlayer'); }

  return await prisma.player.update({ where: { id: adminPlayer.id }, data: { admin: true } });
}

export async function remAdminPlayer (playerId: string, sessionUserId: string) {
  const adminPlayer = await prisma.player.findFirst({ where: { id: playerId } });
  if (!adminPlayer) { throw new Error('playerNotFound'); }

  const player = await prisma.player.findFirst({ where: { userId: sessionUserId, leagueId: adminPlayer.leagueId } });
  if (!player?.admin) { throw new Error('cannotRemAdminPlayer'); }

  return await prisma.player.update({ where: { id: adminPlayer.id }, data: { admin: false } });
}

export async function getUserLeagues (userId: string) {
  const players = await prisma.player.findMany({ where: { userId }, include: { league: true } });

  return await players.map((player) => player.league);
}

export async function createMatch (leagueId: string, match: NewMatch, sessionUserId: string): Promise<MatchWithTeamsAndPlayersAndUsers> {
  const league = await prisma.league.findFirst({ where: { id: leagueId } });
  if (!league) { throw new Error('leagueNotFound'); }

  let team1 = await prisma.team.findFirst({ where: { leagueId: league.id, backId: match.team1.backId, frontId: match.team1.frontId } });
  if (!team1) {
    team1 = await prisma.team.create({ data: { leagueId: league.id, backId: match.team1.backId, frontId: match.team1.frontId, eloTotal: BASE_ELO, matchesPlayed: 0 } });
  }

  let team2 = await prisma.team.findFirst({ where: { leagueId: league.id, backId: match.team2.backId, frontId: match.team2.frontId } });
  if (!team2) {
    team2 = await prisma.team.create({ data: { leagueId: league.id, backId: match.team2.backId, frontId: match.team2.frontId, eloTotal: BASE_ELO, matchesPlayed: 0 } });
  }

  const matchEntity = await prisma.match.create({
    data: {
      leagueId: league.id,
      team1Id: team1.id,
      score1: match.team1.score,
      team2Id: team2.id,
      score2: match.team2.score,
      createdById: sessionUserId,
      team1FrontEloDelta: 0,
      team1BackEloDelta: 0,
      team2FrontEloDelta: 0,
      team2BackEloDelta: 0,
      team1EloDelta: 0,
      team2EloDelta: 0
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
    prisma.match.update({
      where: { id: matchEntity.id },
      data: {
        team1FrontEloDelta: eloDeltas.players[matchEntity.team1.frontId],
        team1BackEloDelta: eloDeltas.players[matchEntity.team1.backId],
        team2FrontEloDelta: eloDeltas.players[matchEntity.team2.frontId],
        team2BackEloDelta: eloDeltas.players[matchEntity.team2.backId],
        team1EloDelta: eloDeltas.teams[team1.id],
        team2EloDelta: eloDeltas.teams[team2.id]
      }
    }),
    prisma.player.update({
      where: { id: matchEntity.team1.frontId },
      data: {
        matchesPlayed: { increment: 1 },
        eloFront: { increment: eloDeltas.players[matchEntity.team1.frontId] },
        eloTotal: { increment: eloDeltas.players[matchEntity.team1.frontId] }
      }
    }),
    prisma.player.update({
      where: { id: matchEntity.team1.backId },
      data: {
        matchesPlayed: { increment: 1 },
        eloBack: { increment: eloDeltas.players[matchEntity.team1.backId] },
        eloTotal: { increment: eloDeltas.players[matchEntity.team1.backId] }
      }
    }),
    prisma.player.update({
      where: { id: matchEntity.team2.frontId },
      data: {
        matchesPlayed: { increment: 1 },
        eloFront: { increment: eloDeltas.players[matchEntity.team2.frontId] },
        eloTotal: { increment: eloDeltas.players[matchEntity.team2.frontId] }
      }
    }),
    prisma.player.update({
      where: { id: matchEntity.team2.backId },
      data: {
        matchesPlayed: { increment: 1 },
        eloBack: { increment: eloDeltas.players[matchEntity.team2.backId] },
        eloTotal: { increment: eloDeltas.players[matchEntity.team2.backId] }
      }
    }),
    prisma.team.update({
      where: { id: team1.id },
      data: {
        matchesPlayed: { increment: 1 },
        eloTotal: { increment: eloDeltas.teams[team1.id] }
      }
    }),
    prisma.team.update({
      where: { id: team2.id },
      data: {
        matchesPlayed: { increment: 1 },
        eloTotal: { increment: eloDeltas.teams[team2.id] }
      }
    })
  ]);

  return matchEntity;
}

export async function deleteMatch (matchId: string, sessionUserId: string) {
  const match = await prisma.match.findFirst({ where: { id: matchId }, include: { team1: true, team2: true } });
  const lastLeagueMatch = await prisma.match.findFirst({ where: { leagueId: match?.leagueId }, orderBy: { date: 'desc' } });

  // For now it's only possible to delete the last match played in the league
  if (!match || match?.id !== lastLeagueMatch?.id) { throw new Error('cannotDeleteMatch'); }

  const player = await prisma.player.findFirst({ where: { userId: sessionUserId, leagueId: match.leagueId } });
  if (!player?.admin) { throw new Error('cannotDeleteMatch'); }

  await Promise.all([
    prisma.match.delete({ where: { id: match.id } }),
    prisma.player.update({
      where: { id: match.team1.frontId },
      data: {
        matchesPlayed: { decrement: 1 },
        eloFront: { decrement: match?.team1FrontEloDelta },
        eloTotal: { decrement: match?.team1FrontEloDelta }
      }
    }),
    prisma.player.update({
      where: { id: match.team1.backId },
      data: {
        matchesPlayed: { decrement: 1 },
        eloBack: { decrement: match?.team1BackEloDelta },
        eloTotal: { decrement: match?.team1BackEloDelta }
      }
    }),
    prisma.player.update({
      where: { id: match.team2.frontId },
      data: {
        matchesPlayed: { decrement: 1 },
        eloFront: { decrement: match?.team2FrontEloDelta },
        eloTotal: { decrement: match?.team2FrontEloDelta }
      }
    }),
    prisma.player.update({
      where: { id: match.team2.backId },
      data: {
        matchesPlayed: { decrement: 1 },
        eloBack: { decrement: match?.team2BackEloDelta },
        eloTotal: { decrement: match?.team2BackEloDelta }
      }
    }),
    prisma.team.update({
      where: { id: match.team1Id },
      data: {
        matchesPlayed: { decrement: 1 },
        eloTotal: { decrement: match?.team1EloDelta }
      }
    }),
    prisma.team.update({
      where: { id: match.team2Id },
      data: {
        matchesPlayed: { decrement: 1 },
        eloTotal: { decrement: match?.team2EloDelta }
      }
    })
  ]);
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
