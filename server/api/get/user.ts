import { getUser } from '../../../db';
import { authOptions } from '../auth/[...]';
import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event, authOptions);
  if (!session) { return null; }

  const query = getQuery(event);
  if (!query.userId) { return null; }

  return await getUser(query.userId as string);
});
