import { Queue } from 'bullmq'
import { defaultRedisConnection, queueNames } from '../config/bullmq'

export const sendEmailQueue = new Queue(queueNames.sendEmail, {
  connection: defaultRedisConnection
})
