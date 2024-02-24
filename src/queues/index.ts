import { jobNames } from '../config/bullmq'
import { handleInvoicementQueue } from './handleInvoicement.queue'

export function startQueues() {
  handleInvoicementQueue.obliterate().then(() => {
    handleInvoicementQueue.add(
      jobNames.handleInvoicement,
      {},
      {
        repeat: {
          pattern: '0 0 * * *' // every second 30 minutes
        }
      }
    )
  })
}
