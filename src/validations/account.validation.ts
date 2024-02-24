import Joi from 'joi'
import { password, phone } from './custom.validation'

const createAccount = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().valid('superuser', 'user'),
    phone: Joi.string().required().custom(phone),
    notion_api_key: Joi.string().optional()
  })
}

const getAccounts = {
  query: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string(),
    role: Joi.string().valid('superuser', 'user'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
}

const getAccount = {
  params: Joi.object().keys({
    account_id: Joi.string().uuid()
  })
}

const updateAccount = {
  params: Joi.object().keys({
    account_id: Joi.string().required().uuid()
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().optional().custom(phone),
      role: Joi.string().optional().valid('superuser', 'user'),
      notion_api_key: Joi.string().optional()
    })
    .min(1)
}

const deleteAccount = {
  params: Joi.object().keys({
    account_id: Joi.string().uuid()
  })
}

export default {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount
}
