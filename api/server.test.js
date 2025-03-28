const db = require('../data/dbConfig')
const request = require('supertest')
const server = require('./server')
const tokenMaker = require('./auth/token-maker')
const jokes = require('./jokes/jokes-data')

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

describe('[POST] /api/auth/login', () => {
  const user = { username: 'foo', password: 'foobar' }
  const badUser1 = { username: 'foo' }
  const badUser2 = { password: 'foobar' }
  const badUser3 = { username: 'foo', password: 'bar' }
  const badUser4 = { username: 'fizz', password: 'foobar'}
  it('[8] responds with 200 on success', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send(user)
    expect(res.status).toBe(200)
  })
  it('[9] responds with correct message on success', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send(user)
    expect(res.body.message).toBe("welcome, foo")
  })
  it('[10] responds with a token on success', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send(user)
    expect(res.body).toHaveProperty('token')
  })
  it('[11] responds with 400 on missing keys', async () => {
    let res = await request(server)
      .post('/api/auth/login')
      .send(badUser1)
    expect(res.status).toBe(400)
    res = await request(server)
      .post('/api/auth/login')
      .send(badUser2)
    expect(res.status).toBe(400)
  })
  it('[12] responds with proper message for missing keys', async() => {
    let res = await request(server)
      .post('/api/auth/login')
      .send(badUser1)
    expect(res.body.message).toBe('username and password required')
    res = await request(server)
      .post('/api/auth/login')
      .send(badUser2)
    expect(res.body.message).toBe('username and password required')
  })
  it('[13] responds with 401 on bad credentials', async () => {
    let res = await request(server)
      .post('/api/auth/login')
      .send(badUser3)
    expect(res.status).toBe(401)
    res = await request(server)
      .post('/api/auth/login')
      .send(badUser4)
    expect(res.status).toBe(401)
  })
  it('[14] responds with proper message for bad credentials', async() => {
    let res = await request(server)
      .post('/api/auth/login')
      .send(badUser3)
    expect(res.body.message).toBe('invalid credentials')
    res = await request(server)
      .post('/api/auth/login')
      .send(badUser4)
    expect(res.body.message).toBe('invalid credentials')
  })
})

describe('[GET] /api/jokes', () => {
  const user = { id: 1, username: 'foo' }
  const token = tokenMaker(user)
  it('[15] responds with status 200 on proper token', async () => {
    const res = await request(server)
      .get('/api/jokes')
      .set('Authorization', token)
    expect(res.status).toBe(200)
  })
  it('[16] responds with jokes on proper token', async () => {
    const res = await request(server)
      .get('/api/jokes')
      .set('Authorization', token)
    expect(res.body).toMatchObject(jokes)
  })
  it('[17] responds with proper message on missing token', async () => {
    const res = await request(server)
      .get('/api/jokes')
    expect(res.body.message).toBe('token required')
  })
  it('[18] responds with correct message on invalid token', async () => {
    const res = await request(server)
      .get('/api/jokes')
      .set('Authorization', 'faketoken')
    expect(res.body.message).toBe('token invalid')
  })
})
