import httpStatus from 'http-status'
import ApiError from '../utils/ApiError'

const authNubank = () => async (req, _, next) => {
  try {
    next()
  } catch (err) {
    next(err)
  }
}

export default authNubank
