import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/prisma';

export const api = () => request(app);

export async function resetDatabase() {
  await prisma.comment.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.history.deleteMany();
  await prisma.friends.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

let counter = 0;

/** Cria um usuário, faz login e devolve id, email e tokens. */
export async function createUser(name = 'Usuário Teste') {
  counter += 1;
  const email = `user${counter}-${Date.now()}@teste.com`;
  const password = 'Senha@123';

  await api().post('/api/auth/v2/register').send({ name, email, password }).expect(201);
  const login = await api().post('/api/auth/v2/login').send({ email, password }).expect(200);
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });

  return {
    id: user.id,
    email,
    password,
    accessToken: login.body.data.accessToken as string,
    refreshToken: login.body.data.refreshToken as string,
    auth: { Authorization: `Bearer ${login.body.data.accessToken}` },
  };
}

export { prisma };
