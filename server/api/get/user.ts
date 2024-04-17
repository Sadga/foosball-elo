import { getUser } from '../../../db';
import { getAuthOptions } from '../auth/[...]';
import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event, getAuthOptions(event));
  if (!session) { return null; }

  const query = getQuery(event);
  if (!query.userId) { return null; }

  return await getUser(event, query.userId as string, session?.user.id);
});
