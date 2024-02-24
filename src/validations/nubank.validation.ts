import Joi from 'joi'
import { password } from './custom.validation'

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required()
  })
}

const requestCode = {
  body: Joi.object().keys({
    cpf: Joi.string().required(),
    password: Joi.string().required().custom(password)
  })
}

const authenticateWithCodeCertificate = {
  body: Joi.object().keys({
    code: Joi.string().required(),
    cpf: Joi.string().required(),
    password: Joi.string().required().custom(password)
  })
}

export default {
  refreshTokens,
  authenticateWithCodeCertificate,
  requestCode
}
