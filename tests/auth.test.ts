import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { api, createUser, prisma, resetDatabase } from './helpers';

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe('Registro', () => {
  it('cria um usuário e não guarda a senha em texto plano', async () => {
    await api()
      .post('/api/auth/v2/register')
      .send({ name: 'Jorge', email: 'jorge@teste.com', password: 'Senha@123' })
      .expect(201);

    const user = await prisma.user.findUniqueOrThrow({ where: { email: 'jorge@teste.com' } });
    expect(user.password).not.toBe('Senha@123');
  });

  it('rejeita senha fraca com erro de validação', async () => {
    const res = await api()
      .post('/api/auth/v2/register')
      .send({ name: 'Jorge', email: 'jorge@teste.com', password: '123' })
      .expect(400);

    expect(res.body.errors[0].field).toBe('password');
  });

  it('retorna 409 para email já cadastrado', async () => {
    const user = await createUser();
    await api()
      .post('/api/auth/v2/register')
      .send({ name: 'Outro', email: user.email, password: 'Senha@123' })
      .expect(409);
  });

  it('retorna 400 para JSON malformado', async () => {
    await api()
      .post('/api/auth/v2/register')
      .set('Content-Type', 'application/json')
      .send('{"name": ')
      .expect(400);
  });
});

describe('Login e sessão', () => {
  it('usa a mesma mensagem para email inexistente e senha errada', async () => {
    const user = await createUser();

    const wrongEmail = await api()
      .post('/api/auth/v2/login')
      .send({ email: 'naoexiste@teste.com', password: 'Senha@123' })
      .expect(401);
    const wrongPassword = await api()
      .post('/api/auth/v2/login')
      .send({ email: user.email, password: 'Errada@123' })
      .expect(401);

    expect(wrongEmail.body.message).toBe(wrongPassword.body.message);
  });

  it('protege rotas sem token ou com token inválido', async () => {
    await api().get('/api/auth/v2/me').expect(401);
    await api().get('/api/auth/v2/me').set('Authorization', 'Bearer invalido').expect(401);
    await api().get('/api/auth/v2/me').set('Authorization', 'Token abc').expect(401);
  });

  it('retorna os dados do usuário autenticado', async () => {
    const user = await createUser();
    const res = await api().get('/api/auth/v2/me').set(user.auth).expect(200);
    expect(res.body.data).toEqual({ userId: user.id, email: user.email });
  });

  it('rotaciona o refresh token e invalida o antigo', async () => {
    const user = await createUser();

    const res = await api()
      .post('/api/auth/v2/refresh')
      .send({ refreshToken: user.refreshToken })
      .expect(200);
    expect(res.body.data.refreshToken).toBeDefined();

    await api().post('/api/auth/v2/refresh').send({ refreshToken: user.refreshToken }).expect(401);
  });

  it('aceita o refresh token pelo header x-refresh-token', async () => {
    const user = await createUser();
    await api().post('/api/auth/v2/refresh').set('x-refresh-token', user.refreshToken).expect(200);
  });

  it('retorna 401 (e não 500) para refresh token malformado', async () => {
    await api().post('/api/auth/v2/refresh').send({ refreshToken: 'nao-e-um-jwt' }).expect(401);
  });

  it('logout invalida o refresh token', async () => {
    const user = await createUser();
    await api()
      .post('/api/auth/v2/logout')
      .set(user.auth)
      .send({ refreshToken: user.refreshToken })
      .expect(200);

    await api().post('/api/auth/v2/refresh').send({ refreshToken: user.refreshToken }).expect(401);
  });
});

describe('Usuários', () => {
  it('lista e busca usuários sem expor a senha', async () => {
    await createUser('Maria Silva');
    await createUser('João Souza');

    const all = await api().get('/api/auth/v2/users').expect(200);
    expect(all.body.data).toHaveLength(2);
    expect(all.body.data[0]).not.toHaveProperty('password');

    const found = await api().get('/api/auth/v2/getByName?name=maria').expect(200);
    expect(found.body.data).toHaveLength(1);
    expect(found.body.data[0].name).toBe('Maria Silva');

    await api().get('/api/auth/v2/getByName').expect(400);
  });

  it('atualiza o próprio perfil', async () => {
    const user = await createUser();
    await api()
      .put(`/api/auth/v2/users/${user.id}`)
      .set(user.auth)
      .send({ bio: 'Fã de ficção científica' })
      .expect(200);

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(updated.bio).toBe('Fã de ficção científica');
  });

  it('impede alterar ou remover outro usuário', async () => {
    const user = await createUser();
    const other = await createUser();

    await api().put(`/api/auth/v2/users/${other.id}`).set(user.auth).send({ name: 'Hacker' }).expect(403);
    await api().delete(`/api/auth/v2/users/${other.id}`).set(user.auth).expect(403);
  });

  it('remove o próprio usuário sem precisar de body', async () => {
    const user = await createUser();
    await api().delete(`/api/auth/v2/users/${user.id}`).set(user.auth).expect(200);
    expect(await prisma.user.findUnique({ where: { id: user.id } })).toBeNull();
  });

  it('valida o formato do id na URL', async () => {
    const user = await createUser();
    await api().delete('/api/auth/v2/users/nao-e-uuid').set(user.auth).expect(400);
  });
});
