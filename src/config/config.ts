import Joi from 'joi'

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid('production', 'development', 'test')
      .required(),
    AWS_REGION: Joi.string().valid('sa-east-1').required(),
    BUCKET_NAME: Joi.string().required().description('S3 Bucket Name'),
    AWS_ACCESS_KEY: Joi.string().required().description('AWS Access Key'),
    AWS_SECRET_KEY: Joi.string().required().description('AWS Secret Key'),
    PORT: Joi.number().default(3001),
    FRONTEND_URL: Joi.string().uri().required().description('Frontend URL'),
    DATABASE_URL: Joi.string().required().description('Database DB url'),
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
    EMAIL_FROM: Joi.string().description(
      'the from field in the emails sent by the app'
    ),
    REDIS_HOST: Joi.string().description('Redis Host for bullmq queues'),
    REDIS_PORT: Joi.number().default(6379)
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
  aws: {
    region: envVars.AWS_REGION,
    s3: {
      accessKey: envVars.AWS_ACCESS_KEY,
      secretKey: envVars.AWS_SECRET_KEY,
      bucket: {
        name: envVars.BUCKET_NAME
      }
    }
  },
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT
  },
  port: envVars.PORT,
  frontend: {
    url: envVars.FRONTEND_URL
  },
  database: {
    url: envVars.DATABASE_URL
  },
  password: {
    resetPasswordMaxRetries: envVars.RESET_PASSWORD_MAX_RETRIES,
    resetPasswordLength: envVars.RESET_PASSWORD_LENGTH
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS
  },
  email: {
    from: envVars.EMAIL_FROM
  }
}
