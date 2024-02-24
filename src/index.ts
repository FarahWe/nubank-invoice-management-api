import app from './app'
import config from './config/config'
import logger from './config/logger'
import '../src/utils/BigInt'
import { gracefulShutdownWorkers, startWorkers } from './workers'
import { startQueues } from './queues'
import { startNubankApis } from './config/nuApi'

// start express
let server = app.listen(config.port, () => {
  logger.info(`Listening to port ${config.port}`)
})

// Start account bank apis
startNubankApis()

// Start BullMQ workers
startWorkers()

startQueues()

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
