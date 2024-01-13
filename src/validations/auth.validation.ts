import Joi from 'joi'
import { password } from './custom.validation'

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required()
  })
}

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required()
  })
}

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required()
  })
}

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required()
  })
}

const changePassword = {
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
    newPassword: Joi.string().required().custom(password)
  })
}

const resetPassword = {
  body: Joi.object().keys({
    code: Joi.number().required(),
    email: Joi.string().required(),
    password: Joi.string().required().custom(password)
  })
}

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required()
  })
}

export default {
  login,
  logout,
  refreshTokens,
  forgotPassword,
  changePassword,
  resetPassword,
  verifyEmail
}
