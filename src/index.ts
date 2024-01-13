import app from './app'
import config from './config/config'
import logger from './config/logger'
import '../src/utils/BigInt'
import { gracefulShutdownWorkers, startWorkers } from './workers'
import { sendEmailQueue } from './queues/sendEmail.queue'
import { jobNames } from './config/bullmq'

// start express
let server = app.listen(config.port, () => {
  logger.info(`Listening to port ${config.port}`)
})

// Start BullMQ workers
startWorkers()

// remove everyting from alertQueue, otherwise we can have
// multiple repetable jobs when changing the pattern
sendEmailQueue.obliterate().then(() => {
  sendEmailQueue.add(
    jobNames.sendEmail,
    {},
    {
      repeat: {
        pattern: '0 * * * * *' // every second 0
      }
    }
  )
})

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed')
      process.exit(1)
    })
  } else {
    process.exit(1)
  }
}

const unexpectedErrorHandler = (error) => {
  logger.error(error)
  exitHandler()
}

process.on('uncaughtException', unexpectedErrorHandler)
process.on('unhandledRejection', unexpectedErrorHandler)

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received')

  await gracefulShutdownWorkers()

  if (server) {
    server.close()
  }
})
