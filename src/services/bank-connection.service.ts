import { Prisma } from '@prisma/client'
import prisma from '../config/database'
import { BankTypes } from '../enums/BankTypes'

export type BankType = BankTypes.NUBANK

const getConnectionByAccountIdAndType = async (
  accountId: string,
  type: BankType
) => {
  return await prisma.bankConnection.findFirst({
    where: {
      account_id: accountId,
      type
    }
  })
}

const getConnectionByRefreshTokenAndType = async (
  accountId: string,
  refreshToken: string,
  type: BankType
) => {
  return await prisma.bankConnection.findFirst({
    where: {
      account_id: accountId,
      refresh_token: refreshToken,
      type
    }
  })
}

const createBankConnection = async (
  data: Prisma.BankConnectionUncheckedCreateInput
) => {
  await prisma.bankConnection.create({
    data
  })
}

const updateBankConnection = async (
  id: string,
  data: Prisma.BankConnectionUpdateInput
) => {
  await prisma.bankConnection.update({ where: { id }, data })
}

export default {
  getConnectionByAccountIdAndType,
  createBankConnection,
  updateBankConnection,
  getConnectionByRefreshTokenAndType
}
