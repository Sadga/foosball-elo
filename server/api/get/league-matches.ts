import { getLeagueMatches } from '../../../db';
import { getAuthOptions } from '../auth/[...]';
import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event, getAuthOptions(event));
  if (!session) { return null; }

  const query = getQuery(event);
  if (!query.leagueId) { return null; }

  return await getLeagueMatches(event, query.leagueId as string);
});
