import { saveUser } from '../../../db';
import { getAuthOptions } from '../auth/[...]';
import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event, getAuthOptions(event));
  if (!session) { return null; }

  const body = await readBody(event);

  return await saveUser(event, body, session?.user.id);
});
