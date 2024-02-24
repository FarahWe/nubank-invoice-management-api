import { Worker } from 'bullmq'
import logger from '../config/logger'
import { dispatchJob } from '../jobs'
import handleInvoicementWorkerOptions from './handleInvoicement.worker'

const workersOptions = [handleInvoicementWorkerOptions]

const workers: Worker[] = []

export const startWorkers = () => {
  for (const wo of workersOptions) {
    logger.info(`Starting worker for queue ${wo.name}`)
    const worker = new Worker(wo.name, dispatchJob, wo.workerOptions)

    workers.push(worker)
    logger.info(`Started worker(${worker.id}) for queue ${worker.name}`)
  }
}

export const gracefulShutdownWorkers = async () => {
  const promises = workers.map(async (worker) => {
    logger.info(`Closing worker(${worker.id}): ${worker.name}`)
    await worker.close()
    logger.info(`Closed worker(${worker.id}): ${worker.name}`)
  })

  await Promise.all(promises)
}
