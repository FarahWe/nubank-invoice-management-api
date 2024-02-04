import { NubankApi } from 'nubank-api'
import prisma from './database'

type SessionType = {
  accountId: string
  nuApi: NubankApi
}

const nuApiSession: SessionType[] = []

export function getNuSession(accountId: string) {
  return nuApiSession.find((session) => session.accountId === accountId)?.nuApi
}

export async function startNubankApis() {
  const accounts = await prisma.account.findMany()

  for (const account of accounts) {
    const accountNuApi = new NubankApi({
      clientName: `invoice-management-${account.name}`
    })

    nuApiSession.push({ accountId: account.id, nuApi: accountNuApi })
  }
}
