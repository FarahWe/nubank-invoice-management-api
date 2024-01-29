import jwt from 'jsonwebtoken'
import moment, { Moment } from 'moment'
import httpStatus from 'http-status'
import config from '../config/config'
import ApiError from '../utils/ApiError'
import accountService from './account.service'
import { TokenTypes } from '../enums/TokenTypes'
import prisma from '../config/database'
import { Account, Token } from '@prisma/client'
import { randomUUID } from 'crypto'

const generateToken = (
  userId: string,
  expires: Moment,
  type: string,
  secret: string = config.jwt.secret
): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type
  }
  return jwt.sign(payload, secret)
}

const getTokensByAccountIds = async (account_ids: string[]) => {
  const tokens = await prisma.token.findMany({
    where: {
      account: {
        id: {
          in: account_ids
        }
      }
    }
  })
  return tokens
}

const saveToken = async (
  token: string,
  account_id: string,
  expires: Moment,
  type: TokenTypes,
  blacklisted: boolean = false
): Promise<Token> => {
  const account = await accountService.getAccountById(account_id)

  if (!account) throw new ApiError(httpStatus.NOT_FOUND, 'Account not found')

  const tokenRow = await prisma.token.create({
    data: {
      id: randomUUID(),
      token: token,
      account_id: account.id,
      expires: expires.toDate(),
      type: type,
      blacklisted: blacklisted
    }
  })

  return tokenRow
}

const verifyToken = async (token: string, type: TokenTypes) => {
  try {
    const payload = jwt.verify(token, config.jwt.secret)

    const account = await accountService.getAccountById(payload.sub)

    if (!account) throw new ApiError(httpStatus.NOT_FOUND, 'Account not found')

    const tokenRow = await prisma.token.findFirstOrThrow({
      where: {
        account: { id: account.id },
        token: token,
        type: type,
        blacklisted: false
      },
      include: {
        account: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return tokenRow
  } catch {
    throw Error('Failed to verify token')
  }
}

const generateAuthTokens = async (account: Account) => {
  const accessTokenExpires = moment().add(
    config.jwt.accessExpirationMinutes,
    'minutes'
  )
  const accessToken = generateToken(
    account.id,
    accessTokenExpires,
    TokenTypes.ACCESS
  )

  const refreshTokenExpires = moment().add(
    config.jwt.refreshExpirationDays,
    'days'
  )
  const refreshToken = generateToken(
    account.id,
    refreshTokenExpires,
    TokenTypes.REFRESH
  )
  await saveToken(
    refreshToken,
    account.id,
    refreshTokenExpires,
    TokenTypes.REFRESH
  )

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate()
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate()
    }
  }
}

export default {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  getTokensByAccountIds
}
