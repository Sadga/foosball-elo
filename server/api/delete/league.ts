import { deleteLeague } from '../../../db';
import { getAuthOptions } from '../auth/[...]';
import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event, getAuthOptions(event));
  if (!session) { throw new Error('userNotAuthenticated'); }

  const body = await readBody(event);
  if (!body.leagueId) { throw new Error('invalidLeague'); }

  return await deleteLeague(event, body.leagueId, session?.user.id);
});
