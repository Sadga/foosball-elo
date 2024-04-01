import { addAdminPlayer } from '../../../db';
import { authOptions } from '../auth/[...]';
import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event, authOptions);
  if (!session) { throw new Error('userNotAuthenticated'); }

  const body = await readBody(event);
  if (!body.playerId) { throw new Error('invalidLeague'); }

  return await addAdminPlayer(body.playerId, session?.user.id);
});
