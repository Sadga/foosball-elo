import { deleteMatch } from '../../../db';
import { getAuthOptions } from '../auth/[...]';
import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event, getAuthOptions(event));
  if (!session) { throw new Error('userNotAuthenticated'); }

  const body = await readBody(event);
  if (!body.matchId) { throw new Error('invalidLeague'); }

  return await deleteMatch(event, body.matchId, session?.user.id);
});
