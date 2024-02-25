import { Job, UnrecoverableError } from 'bullmq'
import logger from '../config/logger'
import prisma from '../config/database'
import { getNuSession } from '../config/nuApi'
import { Client } from '@notionhq/client'
import { NumberToFloat } from '../utils/number-format'
import { handleInvoicementService } from '../services'
import accountConcern from '../concerns/account.concern'
import moment from 'moment'

export default async (job: Job) => {
  logger.info('Starting job: nu invoice management')

  try {
    const accounts = await prisma.account.findMany()

    for (const [accountIndex, account] of accounts.entries()) {
      const nuApiSession = getNuSession(account.id)
      const authState = nuApiSession?.authState

      if (!authState?.refreshToken) {
        job.log(`${account.name} does not have a bank connection`)
        job.updateProgress((100 / accounts.length) * accountIndex + 1)
        continue
      }

      if (!account?.notion_api_key) {
        job.log(`${account.name} does not have a notion connection`)
        job.updateProgress((100 / accounts.length) * accountIndex + 1)
        continue
      }

      await nuApiSession?.auth.authenticateWithRefreshToken(
        authState.refreshToken
      )

      const notion = new Client({ auth: account.notion_api_key })

      if (!account?.notion_database_url) {
        job.log(`${account.name} does not have a notion database connection`)
        job.updateProgress((100 / accounts.length) * accountIndex + 1)
        continue
      }

      const databaseId = accountConcern.getNotionDatabaseId(
        account.notion_database_url
      )

      if (!databaseId) {
        job.log(`${account.name} has a invalid notion database connection`)
        job.updateProgress((100 / accounts.length) * accountIndex + 1)
        continue
      }

      const notionResults =
        await handleInvoicementService.getNotionResultsPaginated(
          notion,
          databaseId
        )

      const cardTransactions =
        (await nuApiSession?.card.getTransactions())?.filter((card) =>
          moment(card.time).isBetween(
            moment().startOf('month'),
            moment().endOf('month')
          )
        ) ?? []

      const notionNubankCardTransactionsIds =
        notionResults.map(
          (row) => row?.properties.nubank_id?.rich_text[0]?.plain_text
        ) ?? []

      for (const cardTransaction of cardTransactions) {
        if (notionNubankCardTransactionsIds.includes(cardTransaction.id)) {
          job.log(`transaction ${cardTransaction.id} already exists`)
        } else {
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
    }
  } catch (error) {
    throw new UnrecoverableError('Error in nu invoice management job')
  } finally {
    job.updateProgress(100)
  }
}
