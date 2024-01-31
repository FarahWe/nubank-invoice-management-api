import { Prisma } from '@prisma/client'

// Define the custom data interface
export interface CustomData {
  account: Prisma.AccountGetPayload<{ include: { BankConnection: true } }>
}
