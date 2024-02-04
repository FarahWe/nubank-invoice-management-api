import { Prisma } from '@prisma/client'
import { NubankApi } from 'nubank-api'

// Define the custom data interface
export interface CustomData {
  account: Prisma.AccountGetPayload<{ include: { BankConnection: true } }>
  nuSession?: NubankApi
}
