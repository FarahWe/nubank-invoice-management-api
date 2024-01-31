import { Job } from 'bullmq'
import logger from '../config/logger'

export default async (job: Job) => {
  logger.info('Começou o job seu lindo')
}
