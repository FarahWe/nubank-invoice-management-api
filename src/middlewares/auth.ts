import { CustomData } from '../@types/controllers/tc.request'
import passport from 'passport'
import httpStatus from 'http-status'
import ApiError from '../utils/ApiError'
import { roleRights } from '../config/roles'

const verifyCallback = (req, resolve, reject, requiredRights) => {
  return async (err, account, info) => {
    if (err || info || !account) {
      return reject(
        new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate')
      )
    }

    ;(req as Request & CustomData).account = account

    if (requiredRights.length) {
      const accountRights = roleRights.get(account.role) ?? []
      const hasRequiredRights = requiredRights.every((requiredRight) =>
        accountRights.includes(requiredRight)
      )
      if (!hasRequiredRights && req.params.id !== account.id) {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'))
      }
    }

    resolve()
  }
}

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate(
        'jwt',
        { session: false },
        verifyCallback(req, resolve, reject, requiredRights)
      )(req, res, next)
    })
      .then(() => next())
      .catch((err) => next(err))
  }

export default auth
