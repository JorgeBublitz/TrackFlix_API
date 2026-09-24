import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { api, createUser, prisma, resetDatabase } from './helpers';

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe('Favoritos', () => {
  it('adiciona, lista (público e privado) e remove', async () => {
    const user = await createUser();

    // A TMDB usa IDs numéricos: a API aceita número e guarda como texto
    await api().post('/api/favorites/v2/favorite').set(user.auth).send({ crossoverId: 550 }).expect(201);
    await api().post('/api/favorites/v2/favorite').set(user.auth).send({ crossoverId: '680' }).expect(201);

    const mine = await api().get('/api/favorites/v2/favorite').set(user.auth).expect(200);
    expect(mine.body.data.sort()).toEqual(['550', '680']);

    const pub = await api().get(`/api/favorites/v2/publicFavorite?userId=${user.id}`).expect(200);
    expect(pub.body.data).toHaveLength(2);

    await api().delete('/api/favorites/v2/favorite').set(user.auth).send({ crossoverId: 550 }).expect(200);
    const after = await api().get('/api/favorites/v2/favorite').set(user.auth).expect(200);
    expect(after.body.data).toEqual(['680']);
  });

  it('retorna 409 (e não 500) para favorito duplicado', async () => {
    const user = await createUser();
    await api().post('/api/favorites/v2/favorite').set(user.auth).send({ crossoverId: 550 }).expect(201);
    await api().post('/api/favorites/v2/favorite').set(user.auth).send({ crossoverId: 550 }).expect(409);
  });

  it('valida o crossoverId e exige autenticação', async () => {
    const user = await createUser();
    await api().post('/api/favorites/v2/favorite').set(user.auth).send({}).expect(400);
    await api().post('/api/favorites/v2/favorite').set(user.auth).send({ crossoverId: '' }).expect(400);
    await api().post('/api/favorites/v2/favorite').send({ crossoverId: 550 }).expect(401);
    await api().get('/api/favorites/v2/publicFavorite').expect(400);
  });
});

describe('Watchlist', () => {
  it('adiciona, lista, impede duplicado e remove', async () => {
    const user = await createUser();
    await api().post('/api/watchList/v2/watchlist').set(user.auth).send({ crossoverId: 1399 }).expect(201);
    await api().post('/api/watchList/v2/watchlist').set(user.auth).send({ crossoverId: 1399 }).expect(409);

    const list = await api().get('/api/watchList/v2/watchlist').set(user.auth).expect(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].crossoverId).toBe('1399');

    await api().get(`/api/watchList/v2/publicWatchlist?userId=${user.id}`).expect(200);
    await api().delete('/api/watchList/v2/watchlist').set(user.auth).send({ crossoverId: 1399 }).expect(200);
    const empty = await api().get('/api/watchList/v2/watchlist').set(user.auth).expect(200);
    expect(empty.body.data).toHaveLength(0);
  });
});

describe('Histórico', () => {
  it('registra de novo um item já visto (sem erro) e o coloca no topo', async () => {
    const user = await createUser();
    await api().post('/api/history/v2/history').set(user.auth).send({ crossoverId: 1 }).expect(201);
    await api().post('/api/history/v2/history').set(user.auth).send({ crossoverId: 2 }).expect(201);
    await api().post('/api/history/v2/history').set(user.auth).send({ crossoverId: 1 }).expect(201);

    const res = await api().get('/api/history/v2/history').set(user.auth).expect(200);
    expect(res.body.data.map((item: { crossoverId: string }) => item.crossoverId)).toEqual(['1', '2']);
  });

  it('limpa o histórico', async () => {
    const user = await createUser();
    await api().post('/api/history/v2/history').set(user.auth).send({ crossoverId: 1 }).expect(201);
    await api().delete('/api/history/v2/history').set(user.auth).expect(200);

    const res = await api().get(`/api/history/v2/publicHistory?userId=${user.id}`).expect(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('Comentários', () => {
  it('cria, lista com o nome do autor, edita e remove', async () => {
    const user = await createUser('Ana');
    await api()
      .post('/api/comments/v2/comments')
      .set(user.auth)
      .send({ crossoverId: 550, content: 'Filme incrível!' })
      .expect(201);

    const list = await api().get('/api/comments/v2/comments/550').expect(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].user.name).toBe('Ana');
    const commentId = list.body.data[0].id;

    await api()
      .put(`/api/comments/v2/comments/${commentId}`)
      .set(user.auth)
      .send({ content: 'Editado' })
      .expect(200);
    const edited = await prisma.comment.findUniqueOrThrow({ where: { id: commentId } });
    expect(edited.content).toBe('Editado');

    await api().delete(`/api/comments/v2/comments/${commentId}`).set(user.auth).expect(200);
    expect(await prisma.comment.count()).toBe(0);
  });

  it('não deixa editar ou apagar comentário de outro usuário', async () => {
    const author = await createUser();
    const other = await createUser();
    await api()
      .post('/api/comments/v2/comments')
      .set(author.auth)
      .send({ crossoverId: 550, content: 'Meu comentário' })
      .expect(201);
    const { id } = await prisma.comment.findFirstOrThrow();

    await api().put(`/api/comments/v2/comments/${id}`).set(other.auth).send({ content: 'Invadido' }).expect(404);
    await api().delete(`/api/comments/v2/comments/${id}`).set(other.auth).expect(404);

    const comment = await prisma.comment.findUniqueOrThrow({ where: { id } });
    expect(comment.content).toBe('Meu comentário');
  });

  it('valida conteúdo vazio ou longo demais', async () => {
    const user = await createUser();
    await api()
      .post('/api/comments/v2/comments')
      .set(user.auth)
      .send({ crossoverId: 550, content: '   ' })
      .expect(400);
    await api()
      .post('/api/comments/v2/comments')
      .set(user.auth)
      .send({ crossoverId: 550, content: 'a'.repeat(1001) })
      .expect(400);
  });

  it('conta likes sem deixar o contador negativo', async () => {
    const user = await createUser();
    await api()
      .post('/api/comments/v2/comments')
      .set(user.auth)
      .send({ crossoverId: 550, content: 'Curta aqui' })
      .expect(201);
    const { id } = await prisma.comment.findFirstOrThrow();

    await api().post(`/api/comments/v2/comments/${id}/like`).set(user.auth).expect(200);
    await api().post(`/api/comments/v2/comments/${id}/unlike`).set(user.auth).expect(200);
    await api().post(`/api/comments/v2/comments/${id}/unlike`).set(user.auth).expect(200);

    const comment = await prisma.comment.findUniqueOrThrow({ where: { id } });
    expect(comment.likes).toBe(0);
  });

  it('retorna 404 ao curtir comentário inexistente', async () => {
    const user = await createUser();
    const missing = '00000000-0000-0000-0000-000000000000';
    await api().post(`/api/comments/v2/comments/${missing}/like`).set(user.auth).expect(404);
    await api().post(`/api/comments/v2/comments/${missing}/unlike`).set(user.auth).expect(404);
  });
});

describe('Amigos', () => {
  it('adiciona, lista, impede duplicado e remove', async () => {
    const user = await createUser();
    const friend = await createUser();

    await api().post(`/api/friends/v2/friends/${friend.id}`).set(user.auth).expect(201);
    await api().post(`/api/friends/v2/friends/${friend.id}`).set(user.auth).expect(409);

    const list = await api().get('/api/friends/v2/friends').set(user.auth).expect(200);
    expect(list.body.data).toEqual([friend.id]);
    await api().get(`/api/friends/v2/publicFriends?userId=${user.id}`).expect(200);

    await api().delete(`/api/friends/v2/friends/${friend.id}`).set(user.auth).expect(200);
    const empty = await api().get('/api/friends/v2/friends').set(user.auth).expect(200);
    expect(empty.body.data).toHaveLength(0);
  });

  it('não permite adicionar a si mesmo nem usuário inexistente', async () => {
    const user = await createUser();
    await api().post(`/api/friends/v2/friends/${user.id}`).set(user.auth).expect(400);
    await api()
      .post('/api/friends/v2/friends/00000000-0000-0000-0000-000000000000')
      .set(user.auth)
      .expect(404);
  });
});

describe('Infraestrutura', () => {
  it('responde ao health check e retorna 404 para rota inexistente', async () => {
    await api().get('/').expect(200);
    await api().get('/api/nao-existe').expect(404);
  });

  it('serve a documentação Swagger', async () => {
    await api().get('/api-docs/').expect(200);
  });
});
