import bcrypt from 'bcryptjs'
import prisma from '../config/database'
import { Account } from '@prisma/client'
import config from '../config/config'

const isEmailTaken = async (email: string, account_id: string) => {
  const account = await prisma.account.findFirst({
    where: {
      email: email,
      NOT: {
        id: account_id
      }
    }
  })

  return !!account
}

const isPasswordMatch = async (account: Account, informedPassword: string) => {
  return await bcrypt.compare(informedPassword, account.password)
}

const isCodeValid = async (account_id: string, code: number) => {
  const account = await prisma.account.findFirst({
    where: {
      AND: {
        id: account_id,
        password_code: code,
        NOT: {
          password_reset_tries: 0
        }
      }
    }
  })

  return !!account
}

const generateRandomCode = async () => {
  const length = config.password.resetPasswordLength
  const min = Math.pow(10, length - 1)
  const max = Math.pow(10, length) - 1

  let randomCode = 0
  let isCodeUnique = false

  // Loop até gerar um código único
  while (!isCodeUnique) {
    randomCode = Math.floor(Math.random() * (max - min + 1)) + min

    // Verifica se o código gerado já existe na lista de códigos
    const codes = await prisma.account.findMany({
      select: { password_code: true }
    })

    isCodeUnique = !codes.some((code) => code.password_code === randomCode)
  }

  return randomCode
}

const getNotionDatabaseId = (databaseUrl: string) => {
  const match = databaseUrl.match(/(?<=\/)[0-9a-f]{32}/i)
  return match ? match[0] : null
}

const sanitizeAccount = (account: Account) => {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    phone: account.phone,
    created_at: account.created_at,
    deleted_at: account.deleted_at,
    updated_at: account.updated_at
  }
}

const sanitizeAccounts = (accounts: Account[]) => {
  return accounts.map((account) => sanitizeAccount(account))
}

export default {
  isEmailTaken,
  isPasswordMatch,
  isCodeValid,
  sanitizeAccount,
  sanitizeAccounts,
  generateRandomCode,
  getNotionDatabaseId
}
