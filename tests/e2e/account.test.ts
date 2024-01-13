import request from 'supertest'
import { faker } from '@faker-js/faker'
import {
  CREATED,
  UNAUTHORIZED,
  FORBIDDEN,
  BAD_REQUEST,
  OK,
  NOT_FOUND,
  NO_CONTENT
} from 'http-status'
import app from '../../src/app'
import { insertAccounts, generateAccount } from '../fixtures/account.fixture'
import { generateAccessToken } from '../fixtures/token.fixture'
import { RoleTypes } from '../../src/enums/RoleTypes'
import { randomUUID } from 'crypto'
import prisma from '../../src/config/database'
import { resetDatabase } from '../helpers/reset-db'

let newAccount
let authToken

beforeEach(async () => {
  const account = await insertAccounts([generateAccount()])

  newAccount = account[0]

  authToken = generateAccessToken(account[0])
})

describe('User routes', () => {
  describe('POST /v1/accounts', () => {
    test('should return 201 and successfully create new user if data is ok', async () => {
      const newUser = generateAccount(RoleTypes.USER)

      const res = await request(app)
        .post('/v1/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newUser)
        .expect(CREATED)

      expect(res.body).not.toHaveProperty('password')
      expect(res.body).toEqual({
        id: expect.anything(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        created_at: expect.anything(),
        updated_at: expect.anything(),
        deleted_at: null
      })

      const dbUser = await prisma.account.findFirst({
        where: {
          id: res.body.id
        }
      })

      expect(dbUser).toBeDefined()
      expect(dbUser?.password).not.toBe(newUser.password)
      expect(dbUser).toMatchObject({
        id: expect.anything(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        created_at: expect.anything(),
        updated_at: expect.anything(),
        deleted_at: null
      })
    })

    test('should return 401 error if access token is missing', async () => {
      const newUser = generateAccount(RoleTypes.USER)

      await request(app).post('/v1/accounts').send(newUser).expect(UNAUTHORIZED)
    })

    test('should return 403 error if logged in user is not manager', async () => {
      const accessToken = generateAccessToken(newAccount)

      const newUser = generateAccount()

      await request(app)
        .post('/v1/accounts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newUser)
        .expect(FORBIDDEN)
    })

    test('should return 400 error if email is invalid', async () => {
      const wrongPayloadAccount = generateAccount(RoleTypes.USER, {
        email: undefined,
        name: '',
        phone: undefined
      })

      const response = await request(app)
        .post('/v1/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...wrongPayloadAccount, password: 'password1' })

      expect(response.statusCode).toBe(BAD_REQUEST)
      expect(response.text).toContain('email')
      expect(response.text).toContain('name')
      expect(response.text).toContain('phone')
    })

    test('should return 400 error if email is already used', async () => {
      const newUser = generateAccount(RoleTypes.SUPERUSER, {
        email: newAccount.email
      })

      const res = await request(app)
        .post('/v1/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newUser)

      expect(res.statusCode).toBe(BAD_REQUEST)
      expect(res.text).toContain('Email already taken')
    })

    test('should return 400 error if password length is less than 6 characters', async () => {
      const newUser = generateAccount(RoleTypes.SUPERUSER, {
        password: '1234'
      })

      const res = await request(app)
        .post('/v1/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newUser)

      expect(res.statusCode).toBe(BAD_REQUEST)
      expect(res.text).toContain('password must be at least 6 characters')
    })

    test('should return 400 error if role is invalid', async () => {
      const newUser = generateAccount('invalid' as any)

      const res = await request(app)
        .post('/v1/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newUser)

      expect(res.statusCode).toBe(BAD_REQUEST)
      expect(res.text).toContain('must be one of [superuser, user]')
    })
  })

  describe('GET /v1/accounts', () => {
    afterEach(async () => {
      await resetDatabase()
    })

    test('should return 200 and apply the default query options', async () => {
      const accounts = await insertAccounts([
        generateAccount(RoleTypes.USER, {
          created_at: new Date('2023-10-03 10:00:00')
        }),
        generateAccount(RoleTypes.USER, {
          created_at: new Date('2023-10-03 10:00:00')
        }),
        generateAccount(RoleTypes.SUPERUSER, {
          created_at: new Date('2023-10-03 10:00:00')
        })
      ])

      const userOne = accounts[0]
      const manager = accounts[2]

      const managerAccessToken = generateAccessToken(manager)

      const res = await request(app)
        .get('/v1/accounts')
        .set('Authorization', `Bearer ${managerAccessToken}`)
        .send()
        .expect(OK)

      expect(res.body).toEqual({
        data: expect.any(Array),
        meta: expect.objectContaining({
          page: 0,
          limit: 10,
          totalPages: 1,
          totalCount: 3,
          hasMore: false
        })
      })
      expect(res.body.data).toHaveLength(3)
      expect(res.body.data[0]).toEqual({
        id: expect.anything(),
        name: userOne.name,
        email: userOne.email,
        role: userOne.role,
        phone: userOne.phone,
        created_at: expect.anything(),
        updated_at: expect.anything(),
        deleted_at: null
      })
    })

    test('should list accounts returning 200 and apply the default query options', async () => {
      const accounts = await insertAccounts([
        generateAccount(RoleTypes.SUPERUSER, {
          created_at: new Date('2023-10-03 10:00:00')
        }),
        generateAccount(RoleTypes.USER, {
          created_at: new Date('2023-10-03 10:00:00')
        }),
        generateAccount(RoleTypes.USER, {
          created_at: new Date('2023-10-03 10:00:00')
        })
      ])

      const manager = accounts[2]

      const managerAccessToken = generateAccessToken(manager)

      const res = await request(app)
        .get('/v1/accounts')
        .set('Authorization', `Bearer ${managerAccessToken}`)
        .send()
        .expect(OK)

      expect(res.body).toEqual({
        data: expect.any(Array),
        meta: expect.objectContaining({
          page: 0,
          limit: 10,
          totalPages: 1,
          totalCount: 1,
          hasMore: false
        })
      })
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0]).toEqual({
        id: expect.anything(),
        name: manager.name,
        email: manager.email,
        role: manager.role,
        phone: manager.phone,
        created_at: expect.anything(),
        updated_at: expect.anything(),
        deleted_at: null
      })
    })

    test('should return 401 if access token is missing', async () => {
      await insertAccounts([
        generateAccount(),
        generateAccount(),
        generateAccount()
      ])

      await request(app).get('/v1/accounts').send().expect(UNAUTHORIZED)
    })

    test('should correctly apply filter on name field', async () => {
      const accounts = await insertAccounts([
        generateAccount(RoleTypes.USER),
        generateAccount(RoleTypes.USER),
        generateAccount()
      ])

      const userOne = accounts[0]
      const manager = accounts[2]

      const adminAccessToken = generateAccessToken(manager)

      const res = await request(app)
        .get('/v1/accounts')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ name: userOne.name })
        .send()
        .expect(OK)

      expect(res.body).toEqual({
        data: expect.any(Array),
        meta: expect.objectContaining({
          page: 0,
          limit: 10,
          totalPages: 1,
          totalCount: 1,
          hasMore: false
        })
      })
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].id).toBe(userOne.id)
    })

    test('should correctly apply filter on role field', async () => {
      const accounts = await insertAccounts([
        generateAccount(RoleTypes.USER),
        generateAccount(RoleTypes.USER),
        generateAccount()
      ])

      const userOne = accounts[0]
      const userTwo = accounts[1]
      const manager = accounts[2]

      const adminAccessToken = generateAccessToken(manager)

      const res = await request(app)
        .get('/v1/accounts')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ role: RoleTypes.USER })
        .send()
        .expect(OK)

      expect(res.body).toEqual({
        data: expect.any(Array),
        meta: {
          page: 0,
          limit: 10,
          totalPages: 1,
          totalCount: 2,
          hasMore: false
        }
      })
      expect(res.body.data).toHaveLength(2)
      expect(res.body.data[0].id).toBe(userOne.id)
      expect(res.body.data[1].id).toBe(userTwo.id)
    })

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      const accounts = await insertAccounts([
        generateAccount(RoleTypes.USER),
        generateAccount(RoleTypes.USER),
        generateAccount()
      ])

      const userOne = accounts[0]
      const userTwo = accounts[1]
      const manager = accounts[2]

      const adminAccessToken = generateAccessToken(manager)

      const res = await request(app)
        .get('/v1/accounts')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:desc' })
        .send()
        .expect(OK)

      expect(res.body).toEqual({
        data: expect.any(Array),
        meta: expect.objectContaining({
          page: 0,
          limit: 10,
          totalPages: 1,
          totalCount: 4, // newAccount and the threes created here
          hasMore: false
        })
      })
      expect(res.body.data).toHaveLength(3)
      expect(res.body.data[0].id).toBe(userOne.id)
      expect(res.body.data[1].id).toBe(userTwo.id)
      expect(res.body.data[2].id).toBe(manager.id)
    })

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      const accounts = await insertAccounts([
        generateAccount(),
        generateAccount(RoleTypes.USER),
        generateAccount(RoleTypes.USER)
      ])

      const manager = accounts[0]
      const userOne = accounts[1]
      const userTwo = accounts[2]

      const adminAccessToken = generateAccessToken(manager)
      const res = await request(app)
        .get('/v1/accounts')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:asc' })
        .send()
        .expect(OK)

      expect(res.body).toEqual({
        data: expect.any(Array),
        meta: expect.objectContaining({
          page: 0,
          limit: 10,
          totalPages: 1,
          totalCount: 4, // newAccount and the threes created here
          hasMore: false
        })
      })
      expect(res.body.data).toHaveLength(3)
      expect(res.body.data[0].id).toBe(manager.id)
      expect(res.body.data[1].id).toBe(userOne.id)
      expect(res.body.data[2].id).toBe(userTwo.id)
    })

    test('should correctly sort the returned array if multiple sorting criteria are specified', async () => {
      const accounts = await insertAccounts([
        generateAccount(RoleTypes.USER, { name: 'admin' }),
        generateAccount(RoleTypes.USER, { name: 'zyzz' }),
        generateAccount(RoleTypes.SUPERUSER, { name: 'admin' })
      ])

      const userOne = accounts[0]
      const userTwo = accounts[1]
      const manager = accounts[2]

      const adminAccessToken = generateAccessToken(manager)

      const res = await request(app)
        .get('/v1/accounts')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:desc,name:asc' })
        .send()
        .expect(OK)

      expect(res.body).toEqual({
        data: expect.any(Array),
        meta: expect.objectContaining({
          page: 0,
          limit: 10,
          totalPages: 1,
          totalCount: 4, // newAccount and the threes created here
          hasMore: false
        })
      })
      expect(res.body.data).toHaveLength(3)

      const expectedOrder = [userOne, userTwo, manager].sort((a, b) => {
        if (a.role < b.role) {
          return 1
        }
        if (a.role > b.role) {
          return -1
        }
        return a.name < b.name ? -1 : 1
      })

      expectedOrder.forEach((user, index) => {
        expect(res.body.data[index].id).toEqual(user.id)
      })
    })

    test('should limit returned array if limit param is specified', async () => {
      const accounts = await insertAccounts([
        generateAccount(RoleTypes.USER),
        generateAccount(RoleTypes.USER),
        generateAccount()
      ])

      const userOne = accounts[0]
      const userTwo = accounts[1]
      const manager = accounts[2]

      const adminAccessToken = generateAccessToken(manager)

      const res = await request(app)
        .get('/v1/accounts')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ limit: 2 })
        .send()
        .expect(OK)

      expect(res.body).toEqual({
        data: expect.any(Array),
        meta: expect.objectContaining({
          page: 0,
          limit: 2,
          totalPages: 2,
          totalCount: 4, // newAccount and the threes created here
          hasMore: true
        })
      })
      expect(res.body.data).toHaveLength(2)
      expect(res.body.data[0].id).toBe(userOne.id)
      expect(res.body.data[1].id).toBe(userTwo.id)
    })

    test('should return the correct page if page and limit params are specified', async () => {
      const accounts = await insertAccounts([
        generateAccount(RoleTypes.USER),
        generateAccount(RoleTypes.USER),
        generateAccount()
      ])

      const manager = accounts[2]

      const adminAccessToken = generateAccessToken(manager)

      const res = await request(app)
        .get('/v1/accounts')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: 1, limit: 2 })
        .send()
        .expect(OK)

      expect(res.body).toEqual({
        data: expect.any(Array),
        meta: expect.objectContaining({
          page: 1,
          limit: 2,
          totalPages: 2,
          totalCount: 4, // newAccount and the threes created here
          hasMore: false
        })
      })
      expect(res.body.data).toHaveLength(2)
      expect(res.body.data[0].id).toBe(manager.id)
    })
  })

  describe('GET /v1/accounts/:userId', () => {
    test('should return 200 and the user object if data is ok', async () => {
      const res = await request(app)
        .get(`/v1/accounts/${newAccount.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send()
        .expect(OK)

      expect(res.body).not.toHaveProperty('password')
      expect(res.body).toEqual({
        id: expect.anything(),
        name: newAccount.name,
        email: newAccount.email,
        role: newAccount.role,
        phone: newAccount.phone,
        created_at: expect.anything(),
        updated_at: expect.anything(),
        deleted_at: null
      })
    })

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .get(`/v1/accounts/${newAccount.id}`)
        .send()
        .expect(UNAUTHORIZED)
    })

    test('should return 400 error if userId is not a valid uuid', async () => {
      await request(app)
        .get('/v1/accounts/invalidId')
        .set('Authorization', `Bearer ${authToken}`)
        .send()
        .expect(BAD_REQUEST)
    })

    test('should return 404 error if user is not found', async () => {
      await request(app)
        .get(`/v1/accounts/${randomUUID()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send()
        .expect(NOT_FOUND)
    })
  })

  describe('DELETE /v1/accounts/:userId', () => {
    test('should return 204 if data is ok', async () => {
      const accounts = await insertAccounts([
        generateAccount(RoleTypes.USER, {
          created_at: new Date('2023-10-03 10:00:00')
        }),
        generateAccount(RoleTypes.SUPERUSER, {
          created_at: new Date('2023-10-03 10:00:00')
        })
      ])

      const userOne = accounts[0]
      const manager = accounts[1]

      const accessToken = generateAccessToken(manager)

      await request(app)
        .delete(`/v1/accounts/${userOne.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(NO_CONTENT)

      const dbUser = await prisma.account.findFirst({
        where: { id: userOne.id }
      })
      expect(dbUser).toBeNull()
    })

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .delete(`/v1/accounts/${newAccount.id}`)
        .send()
        .expect(UNAUTHORIZED)
    })

    test('should return 403 error if user is trying to delete another user', async () => {
      const accounts = await insertAccounts([
        generateAccount(RoleTypes.USER, {
          created_at: new Date('2023-10-03 10:00:00')
        }),
        generateAccount(RoleTypes.USER, {
          created_at: new Date('2023-10-03 10:00:00')
        })
      ])

      const userOne = accounts[0]
      const regularUser = accounts[1]

      const accessToken = generateAccessToken(regularUser)

      await request(app)
        .delete(`/v1/accounts/${userOne.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(FORBIDDEN)
    })

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await request(app)
        .delete('/v1/accounts/invalidId')
        .set('Authorization', `Bearer ${authToken}`)
        .send()
        .expect(BAD_REQUEST)
    })

    test('should return 404 error if user already is not found', async () => {
      await request(app)
        .delete(`/v1/accounts/${randomUUID()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send()
        .expect(NOT_FOUND)
    })
  })

  describe('PUT /v1/accounts/:userId', () => {
    test('should return 200 and successfully update user if data is ok', async () => {
      const updateBody = {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase()
      }

      const res = await request(app)
        .put(`/v1/accounts/${newAccount.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateBody)
        .expect(OK)

      expect(res.body).not.toHaveProperty('password')
      expect(res.body).toEqual({
        id: expect.anything(),
        name: updateBody.name,
        email: updateBody.email,
        role: newAccount.role,
        phone: newAccount.phone,
        created_at: expect.anything(),
        updated_at: expect.anything(),
        deleted_at: null
      })

      const dbUser = await prisma.account.findFirst({
        where: { id: newAccount.id }
      })

      expect(dbUser?.password).not.toBe(res.body.password)
      expect(dbUser).toMatchObject({
        name: updateBody.name,
        email: updateBody.email
      })
    })

    test('should return 401 error if access token is missing', async () => {
      const updateBody = {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase()
      }

      await request(app)
        .put(`/v1/accounts/${newAccount.id}`)
        .send(updateBody)
        .expect(UNAUTHORIZED)
    })

    test('should return 403 if user is updating another user', async () => {
      const accounts = await insertAccounts([
        generateAccount(RoleTypes.USER, {
          created_at: new Date('2023-10-03 10:00:00')
        }),
        generateAccount(RoleTypes.USER, {
          created_at: new Date('2023-10-03 10:00:00')
        })
      ])

      const userOne = accounts[0]
      const userTwo = accounts[1]

      const accountOneAccessToken = generateAccessToken(userOne)
      const updateBody = { name: faker.person.fullName() }

      await request(app)
        .put(`/v1/accounts/${userTwo.id}`)
        .set('Authorization', `Bearer ${accountOneAccessToken}`)
        .send(updateBody)
        .expect(FORBIDDEN)
    })

    test('should return 200 and successfully update user if admin is updating another user', async () => {
      const accounts = await insertAccounts([
        generateAccount(RoleTypes.USER, {
          created_at: new Date('2023-10-03 10:00:00')
        }),
        generateAccount(RoleTypes.SUPERUSER, {
          created_at: new Date('2023-10-03 10:00:00')
        })
      ])

      const userOne = accounts[0]
      const manager = accounts[1]

      const adminAccessToken = generateAccessToken(manager)
      const updateBody = { name: faker.person.fullName() }

      await request(app)
        .put(`/v1/accounts/${userOne.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(OK)
    })

    test('should return 404 if admin is updating another user that is not found', async () => {
      const accounts = await insertAccounts([
        generateAccount(RoleTypes.USER, {
          created_at: new Date('2023-10-03 10:00:00')
        }),
        generateAccount(RoleTypes.SUPERUSER, {
          created_at: new Date('2023-10-03 10:00:00')
        })
      ])

      const manager = accounts[1]

      const adminAccessToken = generateAccessToken(manager)
      const updateBody = { name: faker.person.fullName() }

      await request(app)
        .put(`/v1/accounts/${randomUUID()}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(NOT_FOUND)
    })

    test('should return 400 error if userId is not a valid  uuid', async () => {
      const updateBody = { name: faker.person.fullName() }

      await request(app)
        .put(`/v1/accounts/invalidId`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateBody)
        .expect(BAD_REQUEST)
    })

    test('should return 400 if email is invalid', async () => {
      const accounts = await insertAccounts([
        generateAccount(RoleTypes.USER, {
          created_at: new Date('2023-10-03 10:00:00')
        }),
        generateAccount(RoleTypes.SUPERUSER, {
          created_at: new Date('2023-10-03 10:00:00')
        })
      ])

      const manager = accounts[1]

      const adminAccessToken = generateAccessToken(manager)
      const updateBody = { email: 'invalidEmail' }

      await request(app)
        .put(`/v1/accounts/${manager.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(BAD_REQUEST)
    })

    test('should return 400 if email is already taken', async () => {
      const accounts = await insertAccounts([
        generateAccount(RoleTypes.USER, {
          created_at: new Date('2023-10-03 10:00:00')
        }),
        generateAccount(RoleTypes.SUPERUSER, {
          created_at: new Date('2023-10-03 10:00:00')
        })
      ])

      const userOne = accounts[0]
      const manager = accounts[1]

      const adminAccessToken = generateAccessToken(manager)
      const updateBody = { email: manager.email }

      await request(app)
        .put(`/v1/accounts/${userOne.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(BAD_REQUEST)
    })

    test('should not return 400 if email is my email', async () => {
      const updateBody = { email: newAccount.email }

      await request(app)
        .put(`/v1/accounts/${newAccount.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateBody)
        .expect(OK)
    })

    test('should return 400 if password length is less than 6 characters', async () => {
      const updateBody = { password: '1234' }

      await request(app)
        .put(`/v1/accounts/${newAccount.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateBody)
        .expect(BAD_REQUEST)
    })
  })
})
