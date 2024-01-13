import { Strategy, ExtractJwt } from 'passport-jwt'
import config from './config'
import { accountService } from '../services'
import { TokenTypes } from '../enums/TokenTypes'

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== TokenTypes.ACCESS) {
      throw new Error('Invalid token type')
    }
    const account = await accountService.getAccountById(payload.sub)

    if (!account) {
      return done(null, false)
    }
    done(null, account)
  } catch (error) {
    done(error, false)
  }
}

const jwtStrategy = new Strategy(jwtOptions, jwtVerify)

export { jwtStrategy }
