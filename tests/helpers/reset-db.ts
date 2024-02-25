import prisma from '../../src/config/database'

export const resetDatabase = async () => {
  await prisma.token.deleteMany()
  await prisma.bankConnection.deleteMany()
  await prisma.account.deleteMany()
}
