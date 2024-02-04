import httpStatus from 'http-status'
import ApiError from '../utils/ApiError'
import { getNuSession } from '../config/nuApi'
import { CustomData } from '../@types/controllers/tc.request'

const authNubank = () => async (req, _, next) => {
  try {
    if (!req.account) {
      new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate')
    }

    const nuSession = getNuSession(req.account.id)

    if (!nuSession) {
      new ApiError(
        httpStatus.UNAUTHORIZED,
        'Please authenticate with bank account'
      )
    }

    ;(req as Request & CustomData).nuSession = nuSession

    next()
  } catch (err) {
    next(err)
  }
}

export default authNubank
