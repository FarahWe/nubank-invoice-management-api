import { Job, UnrecoverableError } from 'bullmq'
import logger from '../config/logger'
import prisma from '../config/database'
import { getNuSession } from '../config/nuApi'

export default async (job: Job) => {
  logger.info('Starting job: nu invoice management')

  try {
    const accounts = await prisma.account.findMany()

    for (const account of accounts) {
      const nuApiSession = getNuSession(account.id)
      const authState = nuApiSession?.authState

      if (!authState?.refreshToken) {
        job.log(`${account.name} does not has a bank connection`)
        continue
      }

      await nuApiSession?.auth.authenticateWithRefreshToken(
        authState.refreshToken
      )

      const transactions = await nuApiSession?.card.getTransactions()
    }
  } catch (error) {
    console.log(error)
    job.log('Error in create clients job')
    throw new UnrecoverableError('Error in nu invoice management job')
  } finally {
    job.updateProgress(100)
  }
}
