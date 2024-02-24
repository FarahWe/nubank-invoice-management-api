import { defaultRedisConnection, queueNames } from '../config/bullmq'

const handleInvoicementWorkerOptions = {
  name: queueNames.handleInvoicement,
  workerOptions: {
    connection: defaultRedisConnection,
    concurrency: 10 // Adjust as needed,
  }
}

export default handleInvoicementWorkerOptions
