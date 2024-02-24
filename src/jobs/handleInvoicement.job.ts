import { Job, UnrecoverableError } from 'bullmq'
import logger from '../config/logger'
import prisma from '../config/database'
import { getNuSession } from '../config/nuApi'
import { Client } from '@notionhq/client'
import { NumberToFloat } from '../utils/number-format'
import { handleInvoicementService } from '../services'

export default async (job: Job) => {
  logger.info('Starting job: nu invoice management')

  try {
    const accounts = await prisma.account.findMany()

    for (const account of accounts) {
      const nuApiSession = getNuSession(account.id)
      const authState = nuApiSession?.authState

      if (!authState?.refreshToken) {
        console.log(`${account.name} does not have a bank connection`)
        continue
      }

      if (!account?.notion_api_key) {
        console.log(`${account.name} does not have a notion connection`)
        continue
      }

      await nuApiSession?.auth.authenticateWithRefreshToken(
        authState.refreshToken
      )

      const notion = new Client({ auth: account.notion_api_key })

      const databaseId = '94c2a0fb68414869b9c8e6960ebe736f'

      const notionResults =
        await handleInvoicementService.getNotionResultsPaginated(
          notion,
          databaseId
        )

      const cardTransactions =
        (await nuApiSession?.card?.getTransactions()) ?? []

      const notionNubankCardTransactionsIds =
        notionResults.map(
          (row) => row?.properties.nubank_id?.rich_text[0]?.plain_text
        ) ?? []

      for (const cardTransaction of cardTransactions) {
        if (notionNubankCardTransactionsIds.includes(cardTransaction.id)) {
          console.log('ja existe', cardTransaction.id)
          continue
        }

        await notion.pages.create({
          parent: {
            database_id: databaseId
          },
          properties: {
            // @ts-ignore
            Gastos: {
              title: [
                {
                  text: {
                    content: cardTransaction.description
                  }
                }
              ]
            },
            // @ts-ignore
            nubank_id: {
              rich_text: [
                {
                  text: {
                    content: cardTransaction.id
                  }
                }
              ]
            },
            // @ts-ignore
            tags: {
              select: {
                name: 'Saida',
                color: 'red'
              }
            },
            // @ts-ignore
            data: {
              date: {
                start: cardTransaction.time
              }
            },
            // @ts-ignore
            valor: {
              number: NumberToFloat(cardTransaction.amount)
            }
          }
        })
      }
    }
  } catch (error) {
    console.error(error)
    console.log('Error in create clients job')
    throw new UnrecoverableError('Error in nu invoice management job')
  } finally {
    job.updateProgress(100)
  }
}
