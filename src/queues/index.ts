import { jobNames } from '../config/bullmq'
import { handleInvoicementQueue } from './handleInvoicement.queue'

export function startQueues() {
  handleInvoicementQueue.obliterate().then(() => {
    handleInvoicementQueue.add(
      jobNames.handleInvoicement,
      {},
      {
        repeat: {
          // pattern: '0 13 * * *' // every day 13 hrs
          pattern: '*/5 * * * *'
        }
      }
    )
  })
}
