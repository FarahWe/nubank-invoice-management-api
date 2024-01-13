import bcrypt from 'bcryptjs'
import { faker } from '@faker-js/faker'
import { Account, Prisma } from '@prisma/client'
import { RoleTypes } from '../../src/enums/RoleTypes'
import prisma from '../../src/config/database'

export const generateAccount = (
  role?: RoleTypes,
  partialAccount?: Partial<Prisma.AccountCreateInput>
): Prisma.AccountCreateInput => {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: '123456',
    role: role ?? RoleTypes.SUPERUSER,
    phone: '99999999999', // BR Number
    ...partialAccount
  } as Prisma.AccountCreateInput
}

export const insertAccounts = async (
  accounts: Prisma.AccountCreateInput[]
): Promise<Account[]> => {
  const data: Account[] = []

  for (let i = 0; i < accounts.length; i++) {
    const hashPassword = await bcrypt.hash(
      accounts[i].password ?? '123456',
      await bcrypt.genSalt()
    )

    const res = await prisma.account.create({
      data: {
        ...accounts[i],
        password: hashPassword
      }
    })

    data.push(res)
  }

  return data
}
