import { defaultRedisConnection, queueNames } from '../config/bullmq'

const sendEmailWorkerOptions = {
  name: queueNames.sendEmail,
  workerOptions: {
    connection: defaultRedisConnection,
    concurrency: 10 // Adjust as needed
  }
}

export default sendEmailWorkerOptions
