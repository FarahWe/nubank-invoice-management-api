import Joi from 'joi'

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid('production', 'development', 'test')
      .required(),
    PORT: Joi.number().default(3001),
    JWT_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description('days after which refresh tokens expire'),
    RESET_PASSWORD_MAX_RETRIES: Joi.number()
      .default(4)
      .description('Number max of retries to reset password'),
    RESET_PASSWORD_LENGTH: Joi.number()
      .default(4)
      .description('Length of a password code'),
    REDIS_HOST: Joi.string().description('Redis Host for bullmq queues'),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_PASSWORD: Joi.string().description(
      'Redis password for bullmq queues'
    ),
    REDIS_USER: Joi.string().description('Redis username')
  })
  .unknown()

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env)
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

export default {
  env: envVars.NODE_ENV,
  pagination: {
    limit: 10
  },
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD,
    user: envVars.REDIS_USER
  },
  port: envVars.PORT,
  password: {
    resetPasswordMaxRetries: envVars.RESET_PASSWORD_MAX_RETRIES,
    resetPasswordLength: envVars.RESET_PASSWORD_LENGTH
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS
  }
}
