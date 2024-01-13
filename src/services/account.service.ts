import bcrypt from 'bcryptjs'
import httpStatus from 'http-status'
import ApiError from '../utils/ApiError'
import {
  RegisterBody,
  UpdateBody
} from '../@types/controllers/auth.controller.type'
import tokenService from './token.service'
import { Account, Prisma } from '@prisma/client'
import prisma from '../config/database'
import accountConcerns from '../concerns/account.concern'
import { RoleTypes } from '../enums/RoleTypes'
import config from '../config/config'

const createAccount = async (registerBody: RegisterBody): Promise<Account> => {
  const existingAccount = await getAccountByEmail(registerBody.email)

  if (existingAccount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken')
  }

  const hashPassword = await bcrypt.hash(
    registerBody.password,
    await bcrypt.genSalt()
  )

  const account = await prisma.account.create({
    data: {
      name: registerBody.name,
      email: registerBody.email,
      password: hashPassword,
      role: registerBody.role,
      phone: registerBody.phone
    }
  })

  return account
}

export type OptionsAccountQuery = {
  where: Prisma.AccountWhereInput
  orderBy: Prisma.AccountOrderByWithRelationInput[]
}

type PaginatedAccountResult = Promise<
  [
    data: Account[],
    totalCount: number,
    totalPages: number,
    pageSize: number,
    page: number,
    hasMore: boolean
  ]
>

const queryAccounts = async (
  options: OptionsAccountQuery,
  itemsPerPage: number,
  page: number
): PaginatedAccountResult => {
  const { where, orderBy } = options

  const skip = itemsPerPage * page

  const [accounts, totalCount] = await prisma.$transaction([
    prisma.account.findMany({
      skip: skip,
      take: itemsPerPage,

      orderBy,
      where: {
        ...where
      }
    }),

    prisma.account.count({
      where: {
        ...where
      }
    })
  ])

  const totalPages = Math.ceil(Number(totalCount) / itemsPerPage)
  const hasMore = page < totalPages - 1

  return [accounts, Number(totalCount), totalPages, itemsPerPage, page, hasMore]
}

const getAccountById = async (id: string, options?: any) => {
  return await prisma.account.findFirst({
    where: { id: id },
    include: {
      ...options?.include
    }
  })
}

const getAccountByEmail = async (email: string) => {
  return await prisma.account.findFirst({
    where: {
      email: email
    }
  })
}

const updatePassword = async (newPassword: string, account_id: string) => {
  const hashPassword = await bcrypt.hash(newPassword, await bcrypt.genSalt())

  await prisma.account.update({
    where: { id: account_id },
    data: {
      password: hashPassword,
      password_code: null,
      password_reset_tries: null,
      reset_password_sent_at: null
    }
  })
}

const updateAccountById = async (
  account: Account,
  updateBody: UpdateBody,
  requesterAccount: Account
) => {
  if (
    updateBody.email &&
    (await accountConcerns.isEmailTaken(updateBody.email, account.id))
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken')
  }

  if (updateBody.email) account.email = updateBody.email
  if (updateBody.name) account.name = updateBody.name
  if (updateBody.phone) account.phone = updateBody.phone
  // superuser can edit role
  if (updateBody.role && requesterAccount.role === RoleTypes.SUPERUSER)
    account.role = updateBody.role

  const updatedAccount = await prisma.account.update({
    data: {
      email: account.email,
      role: account.role,
      name: account.name,
      phone: account.phone
    },
    where: {
      id: account.id
    }
  })
  return updatedAccount
}

const deleteAccountById = async (account: Account) => {
  const tokens = await tokenService.getTokensByAccountIds([account.id])
  const tokenIds = tokens.map((item) => item.id)

  await prisma.token.deleteMany({
    where: {
      id: {
        in: tokenIds
      }
    }
  })

  await prisma.account.softDelete({
    where: {
      id: account.id
    }
  })
}

const generateNewPasswordCode = async (account: Account) => {
  const newCode = await accountConcerns.generateRandomCode()

  await prisma.account.update({
    where: { id: account.id },
    data: {
      password_code: newCode,
      password_reset_tries: config.password.resetPasswordMaxRetries,
      reset_password_sent_at: new Date()
    }
  })

  return {
    code: newCode,
    tries: config.password.resetPasswordMaxRetries
  }
}

export default {
  createAccount,
  queryAccounts,
  getAccountById,
  getAccountByEmail,
  updateAccountById,
  deleteAccountById,
  updatePassword,
  generateNewPasswordCode
}
