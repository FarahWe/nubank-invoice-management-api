import { Queue } from 'bullmq'
import { defaultRedisConnection, queueNames } from '../config/bullmq'

export const handleInvoicementQueue = new Queue(queueNames.handleInvoicement, {
  connection: defaultRedisConnection
})
