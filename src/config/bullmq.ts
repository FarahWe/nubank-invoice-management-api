import config from './config'

export const queueNames = {
  sendEmail: 'SEND_EMAIL_QUEUE'
}

export const jobNames = {
  sendEmail: 'SEND_EMAIL_JOB'
}

export const defaultRedisConnection = {
  host: config.redis.host,
  port: config.redis.port
}
