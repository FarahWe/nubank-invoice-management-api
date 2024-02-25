import request from 'supertest'
import {
  BAD_REQUEST,
  OK,
  UNAUTHORIZED,
  NO_CONTENT,
  NOT_FOUND,
  FORBIDDEN
} from 'http-status'
import { createRequest, createResponse } from 'node-mocks-http'
import moment from 'moment'
import { compare } from 'bcryptjs'
import app from '../../src/app'
import config from '../../src/config/config'
import auth from '../../src/middlewares/auth'
import { tokenService, emailService } from '../../src/services'
import ApiError from '../../src/utils/ApiError'
import { permissions } from '../../src/config/roles'
import { insertAccounts, generateAccount } from '../fixtures/account.fixture'
import { generateAccessToken } from '../fixtures/token.fixture'
import { TokenTypes } from '../../src/enums/TokenTypes'
import { RoleTypes } from '../../src/enums/RoleTypes'
import prisma from '../../src/config/database'
import { randomUUID } from 'crypto'
import { Account } from '@prisma/client'
import accountConcern from '../../src/concerns/account.concern'

describe('Auth routes', () => {
  describe('POST /v1/auth/login', () => {
    test('should return 200 and login user if email and password match', async () => {
      const accountData = generateAccount()
      await insertAccounts([accountData])

      const loginCredentials = {
        email: accountData.email,
        password: accountData.password
      }

      const res = await request(app)
        .post('/v1/auth/login')
        .send(loginCredentials)
        .expect(OK)

      const account = res.body.account

      console.log(account.deleted_at)

      expect(account).toEqual({
        id: expect.anything(),
        name: expect.anything(),
        role: expect.anything(),
        email: loginCredentials.email,
        phone: expect.anything(),
        created_at: expect.anything(),
        updated_at: expect.anything(),
        deleted_at: null
      })

      expect(res.body.tokens).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() }
      })
    })

    test('should return 401 error if there are no users with that email', async () => {
      const accountOne = generateAccount()

      const loginCredentials = {
        email: accountOne.email,
        password: accountOne.password
      }

      const res = await request(app)
        .post('/v1/auth/login')
        .send(loginCredentials)
        .expect(UNAUTHORIZED)

      expect(res.body).toEqual({
        code: UNAUTHORIZED,
        message: 'Incorrect email or password'
      })
    })

    test('should return 401 error if password is wrong', async () => {
      const accountData = generateAccount()

      await insertAccounts([accountData])
      const loginCredentials = {
        email: accountData.email,
        password: 'wrongPassword1'
      }

      const res = await request(app)
        .post('/v1/auth/login')
        .send(loginCredentials)
        .expect(UNAUTHORIZED)

      expect(res.body).toEqual({
        code: UNAUTHORIZED,
        message: 'Incorrect email or password'
      })
    })
  })

  describe('POST /v1/auth/logout', () => {
    test('should return 204 if refresh token is valid', async () => {
      const accounts = await insertAccounts([generateAccount()])
      const accountOne = accounts[0]

      const expires = moment().add(config.jwt.refreshExpirationDays, 'days')
      const refreshToken = tokenService.generateToken(
        accountOne.id,
        expires,
        TokenTypes.REFRESH
      )
      await tokenService.saveToken(
        refreshToken,
        accountOne.id,
        expires,
        TokenTypes.REFRESH
      )

      await request(app)
        .post('/v1/auth/logout')
        .send({ refreshToken })
        .expect(NO_CONTENT)

      const dbRefreshTokenDoc = await prisma.token.findFirst({
        where: { token: refreshToken }
      })

      expect(dbRefreshTokenDoc).toBe(null)
    })

    test('should return 400 error if refresh token is missing from request body', async () => {
      await request(app).post('/v1/auth/logout').send().expect(BAD_REQUEST)
    })

    test('should return 404 error if refresh token is not found in the database', async () => {
      const accounts = await insertAccounts([generateAccount()])
      const accountOne = accounts[0]

      const expires = moment().add(config.jwt.refreshExpirationDays, 'days')
      const refreshToken = tokenService.generateToken(
        accountOne.id,
        expires,
        TokenTypes.REFRESH
      )

      await request(app)
        .post('/v1/auth/logout')
        .send({ refreshToken })
        .expect(NOT_FOUND)
    })

    test('should return 404 error if refresh token is blacklisted', async () => {
      const accounts = await insertAccounts([generateAccount()])

      const accountOne = accounts[0]
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days')
      const refreshToken = tokenService.generateToken(
        accountOne.id,
        expires,
        TokenTypes.REFRESH
      )
      await tokenService.saveToken(
        refreshToken,
        accountOne.id,
        expires,
        TokenTypes.REFRESH,
        true
      )

      await request(app)
        .post('/v1/auth/logout')
        .send({ refreshToken })
        .expect(NOT_FOUND)
    })
  })

  describe('POST /v1/auth/refresh-tokens', () => {
    test('should return 200 and new auth tokens if refresh token is valid', async () => {
      const accounts = await insertAccounts([generateAccount()])

      const accountOne = accounts[0]
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days')
      const refreshToken = tokenService.generateToken(
        accountOne.id,
        expires,
        TokenTypes.REFRESH
      )
      await tokenService.saveToken(
        refreshToken,
        accountOne.id,
        expires,
        TokenTypes.REFRESH
      )

      const res = await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken })
        .expect(OK)

      expect(res.body).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() }
      })

      const dbRefreshTokenDoc = await prisma.token.findFirst({
        where: { token: refreshToken }
      })

      expect(dbRefreshTokenDoc).toEqual({
        id: expect.anything(),
        type: TokenTypes.REFRESH,
        account_id: accountOne.id,
        blacklisted: false,
        updated_at: expect.anything(),
        created_at: expect.anything(),
        token: refreshToken,
        expires: expect.anything()
      })

      const dbRefreshTokenCount = await prisma.token.count({
        where: { account_id: accountOne.id }
      })
      expect(dbRefreshTokenCount).toBe(1)
    })

    test('should return 400 error if refresh token is missing from request body', async () => {
      await request(app)
        .post('/v1/auth/refresh-tokens')
        .send()
        .expect(BAD_REQUEST)
    })

    test('should return 401 error if refresh token is signed using an invalid secret', async () => {
      const accounts = await insertAccounts([generateAccount()])

      const accountOne = accounts[0]
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days')
      const refreshToken = tokenService.generateToken(
        accountOne.id,
        expires,
        TokenTypes.REFRESH,
        'invalidSecret'
      )
      await tokenService.saveToken(
        refreshToken,
        accountOne.id,
        expires,
        TokenTypes.REFRESH
      )

      await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken })
        .expect(UNAUTHORIZED)
    })

    test('should return 401 error if refresh token is not found in the database', async () => {
      const accounts = await insertAccounts([generateAccount()])

      const accountOne = accounts[0]
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days')
      const refreshToken = tokenService.generateToken(
        accountOne.id,
        expires,
        TokenTypes.REFRESH
      )

      await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken })
        .expect(UNAUTHORIZED)
    })

    test('should return 401 error if refresh token is blacklisted', async () => {
      const accounts = await insertAccounts([generateAccount()])

      const accountOne = accounts[0]
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days')
      const refreshToken = tokenService.generateToken(
        accountOne.id,
        expires,
        TokenTypes.REFRESH
      )
      await tokenService.saveToken(
        refreshToken,
        accountOne.id,
        expires,
        TokenTypes.REFRESH,
        true
      )

      await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken })
        .expect(UNAUTHORIZED)
    })

    test('should return 401 error if refresh token is expired', async () => {
      const accounts = await insertAccounts([generateAccount()])

      const accountOne = accounts[0]
      const expires = moment().subtract(1, 'minutes')
      const refreshToken = tokenService.generateToken(
        accountOne.id,
        expires,
        TokenTypes.REFRESH
      )
      await tokenService.saveToken(
        refreshToken,
        accountOne.id,
        expires,
        TokenTypes.REFRESH
      )

      await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken })
        .expect(UNAUTHORIZED)
    })

    test('should return 404 error if user is not found', async () => {
      const randomAccountUuid = randomUUID()

      const expires = moment().add(config.jwt.refreshExpirationDays, 'days')
      const refreshToken = tokenService.generateToken(
        randomAccountUuid,
        expires,
        TokenTypes.REFRESH
      )
      await expect(
        async () =>
          await tokenService.saveToken(
            refreshToken,
            randomAccountUuid,
            expires,
            TokenTypes.REFRESH
          )
      ).rejects.toBeInstanceOf(ApiError)
    })
  })

  describe('POST /v1/auth/change-password', () => {
    test('should return 204 to password changed correctly', async () => {
      const accounts = await insertAccounts([
        generateAccount(RoleTypes.USER, { password: '123456' })
      ])

      const accessToken = generateAccessToken(accounts[0])

      await request(app)
        .post('/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ password: '123456', newPassword: 'changedpassword' })
        .expect(NO_CONTENT)

      const account = await prisma.account.findFirstOrThrow({
        where: {
          id: accounts[0].id
        }
      })

      const isPasswordMatch = await accountConcern.isPasswordMatch(
        account,
        'changedpassword'
      )

      expect(isPasswordMatch).toBe(true)
    })

    test('should return 401 to password invalid', async () => {
      const accounts = await insertAccounts([
        generateAccount(RoleTypes.USER, { password: '123456' })
      ])

      const accessToken = generateAccessToken(accounts[0])

      await request(app)
        .post('/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ password: 'invalid', newPassword: 'changedpassword' })
        .expect(UNAUTHORIZED)
    })

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .post('/v1/auth/change-password')
        .send()
        .expect(UNAUTHORIZED)
    })
  })

  describe('Auth middleware', () => {
    test('should call next with no errors if access token is valid', async () => {
      const accounts = await insertAccounts([generateAccount()])

      const accountOne = accounts[0]
      const accessToken = generateAccessToken(accountOne)

      const req = createRequest({
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      const next = vitest.fn()

      await auth()(req, createResponse(), next)

      expect(next).toHaveBeenCalledWith()
      expect(req.account.id).toEqual(accountOne.id)
    })

    test('should call next with unauthorized error if access token is not found in header', async () => {
      const req = createRequest()
      const next = vitest.fn()

      await auth()(req, createResponse(), next)

      expect(next).toHaveBeenCalledWith(expect.any(ApiError))
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: UNAUTHORIZED,
          message: 'Please authenticate'
        })
      )
    })

    test('should call next with unauthorized error if access token is not a valid jwt token', async () => {
      const req = createRequest({
        headers: { Authorization: 'Bearer randomToken' }
      })
      const next = vitest.fn()

      await auth()(req, createResponse(), next)

      expect(next).toHaveBeenCalledWith(expect.any(ApiError))
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: UNAUTHORIZED,
          message: 'Please authenticate'
        })
      )
    })

    test('should call next with unauthorized error if the token is not an access token', async () => {
      const accounts = await insertAccounts([generateAccount()])

      const accountOne = accounts[0]
      const expires = moment().add(
        config.jwt.accessExpirationMinutes,
        'minutes'
      )
      const refreshToken = tokenService.generateToken(
        accountOne.id,
        expires,
        TokenTypes.REFRESH
      )
      const req = createRequest({
        headers: { Authorization: `Bearer ${refreshToken}` }
      })
      const next = vitest.fn()

      await auth()(req, createResponse(), next)

      expect(next).toHaveBeenCalledWith(expect.any(ApiError))
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: UNAUTHORIZED,
          message: 'Please authenticate'
        })
      )
    })

    test('should call next with unauthorized error if access token is generated with an invalid secret', async () => {
      const accounts = await insertAccounts([generateAccount()])

      const accountOne = accounts[0]
      const expires = moment().add(
        config.jwt.accessExpirationMinutes,
        'minutes'
      )
      const accessToken = tokenService.generateToken(
        accountOne.id,
        expires,
        TokenTypes.ACCESS,
        'invalidSecret'
      )
      const req = createRequest({
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      const next = vitest.fn()

      await auth()(req, createResponse(), next)

      expect(next).toHaveBeenCalledWith(expect.any(ApiError))
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: UNAUTHORIZED,
          message: 'Please authenticate'
        })
      )
    })

    test('should call next with unauthorized error if access token is expired', async () => {
      const accounts = await insertAccounts([generateAccount()])

      const accountOne = accounts[0]
      const expires = moment().subtract(1, 'minutes')
      const accessToken = tokenService.generateToken(
        accountOne.id,
        expires,
        TokenTypes.ACCESS
      )
      const req = createRequest({
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      const next = vitest.fn()

      await auth()(req, createResponse(), next)

      expect(next).toHaveBeenCalledWith(expect.any(ApiError))
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: UNAUTHORIZED,
          message: 'Please authenticate'
        })
      )
    })

    test('should call next with unauthorized error if user is not found', async () => {
      const randomAccountUuid = randomUUID()
      const accessToken = generateAccessToken({
        id: randomAccountUuid
      } as Account)

      const req = createRequest({
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      const next = vitest.fn()

      await auth()(req, createResponse(), next)

      expect(next).toHaveBeenCalledWith(expect.any(ApiError))
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: UNAUTHORIZED,
          message: 'Please authenticate'
        })
      )
    })

    test('should call next with forbidden error if user does not have required rights and userId is not in params', async () => {
      const accounts = await insertAccounts([generateAccount()])

      const accountOne = accounts[0]
      const accessToken = generateAccessToken(accountOne)

      const req = createRequest({
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      const next = vitest.fn()

      await auth('anyRight')(req, createResponse(), next)

      expect(next).toHaveBeenCalledWith(expect.any(ApiError))
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: FORBIDDEN, message: 'Forbidden' })
      )
    })

    test('should call next with no errors if user has required rights', async () => {
      const accounts = await insertAccounts([generateAccount()])

      const accountOne = accounts[0]
      const accessToken = generateAccessToken(accountOne)
      const req = createRequest({
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      const next = vitest.fn()

      await auth(permissions.getAccounts)(req, createResponse(), next)

      expect(next).toHaveBeenCalledWith()
    })
  })
})
