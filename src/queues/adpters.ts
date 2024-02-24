import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { sendEmailQueue } from './sendEmail.queue'
import { handleInvoicementQueue } from './handleInvoicement.queue'

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/v1/admin/queues')
const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [
    new BullMQAdapter(sendEmailQueue),
    new BullMQAdapter(handleInvoicementQueue)
  ],
  serverAdapter: serverAdapter
})

export { serverAdapter }
