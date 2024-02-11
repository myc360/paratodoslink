import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { db } from './db';

const serverAuth = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    throw new Error('Não conectado');
  }

  const currentUser = await db.user.findUnique({
    where: {
      email: session.user.email,
    },
    include: {
      accounts: true,
    },
  });

  if (!currentUser) {
    throw new Error('Não conectado');
  }

  return { currentUser };
};

export default serverAuth;
