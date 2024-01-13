import prisma from '../../src/config/database'

export const resetDatabase = async () => {
  const deleteTokens = prisma.token.deleteMany()
  const deleteAccounts = prisma.account.deleteMany()

  await prisma.$transaction([deleteTokens, deleteAccounts])
}
