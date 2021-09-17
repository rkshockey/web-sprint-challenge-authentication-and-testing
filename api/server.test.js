const db = require('../data/dbConfig')
const request = require('supertest')
const server = require('./server')

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
})

beforeEach(async () => {
  await db.seed.run()
})

test('sanity', () => {
  expect(true).not.toBe(false)
})

describe('[POST] /api/auth/register', () => {
  const user = { username: 'fizz', password: 'buzz' }
  const badUser1 = { username: 'fizz' }
  const badUser2 = { password: 'buzz' }
  const badUser3 = { username: 'foo', password: 'bar' }
  it('[1] responds with a 201 on success', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send(user)
    expect(res.status).toBe(201)
  })
  it('[2] responds with a 400 error on bad request', async () => {
    let res = await request(server)
      .post('/api/auth/register')
      .send(badUser1)
    expect(res.status).toBe(400)
    res = await request(server)
      .post('/api/auth/register')
      .send(badUser2)
    expect(res.status).toBe(400)
    res = await request(server)
      .post('/api/auth/register')
      .send(badUser3)
    expect(res.status).toBe(400)
  })
  it('[3] responds with correct error on missing keys', async () => {
    let res = await request(server)
      .post('/api/auth/register')
      .send(badUser1)
    expect(res.body.message).toBe("username and password required")
    res = await request(server)
      .post('/api/auth/register')
      .send(badUser2)
    expect(res.body.message).toBe("username and password required")
  })
  it('[4] responds with correct error on taken username', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send(badUser3)
    expect(res.body.message).toBe("username taken")
  })
  it('[5] responds with new user on success', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send(user)
    expect(res.body).toMatchObject({ username: 'fizz' , id: 3 })
  })
  it('[6] does not save password as base string', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send(user)
    expect(res.body.password).not.toBe(user.password)
  })
  it ('[7] saves new user to the database', async () => {
    await request(server)
      .post('/api/auth/register')
      .send(user) 
    const actual = await db('users')
    expect(actual).toHaveLength(3)
  })
})
