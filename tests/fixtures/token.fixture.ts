import moment from 'moment'
import config from '../../src/config/config'
import tokenService from '../../src/services/token.service'
import { TokenTypes } from '../../src/enums/TokenTypes'
import { Account } from '@prisma/client'

const accessTokenExpires = moment().add(
  config.jwt.accessExpirationMinutes,
  'minutes'
)
export const generateAccessToken = (account: Account) =>
  tokenService.generateToken(account.id, accessTokenExpires, TokenTypes.ACCESS)
