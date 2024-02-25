import config from './config'

export const queueNames = {
  sendEmail: 'SEND_EMAIL_QUEUE',
  handleInvoicement: 'HANDLE_INVOICEMENT_JOB'
}

export const jobNames = {
  sendEmail: 'SEND_EMAIL_JOB',
  handleInvoicement: 'HANDLE_INVOICEMENT_JOB'
}

export const defaultRedisConnection = {
  host: config.redis.host,
  port: config.redis.port,
  username: config.redis.user,
  password: config.redis.password
}
