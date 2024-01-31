import { Job } from 'bullmq'
import { jobNames } from '../config/bullmq'
import logger from '../config/logger'
import sendEmailJob from './sendEmail.job'
import handleInvoicementJob from './handleInvoicement.job'

export const dispatchJob = async (job: Job) => {
  const { name } = job

  switch (name) {
    case jobNames.sendEmail:
      await sendEmailJob(job)
      break

    case jobNames.handleInvoicement:
      await handleInvoicementJob(job)
      break

    default:
      logger.error(`Invalid JOB NAME!`)
      break
  }
}
