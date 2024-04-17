import { createMatch } from '../../../db';
import { getAuthOptions } from '../auth/[...]';
import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event, getAuthOptions(event));
  if (!session) { return null; }

  const body = await readBody(event);

  return await createMatch(event, body.leagueId, body.match, session?.user.id);
});
