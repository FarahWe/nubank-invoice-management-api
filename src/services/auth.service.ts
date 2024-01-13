import httpStatus from 'http-status'
import tokenService from './token.service'
import accountService from './account.service'
import ApiError from '../utils/ApiError'
import prisma from '../config/database'
import accountConcerns from '../concerns/account.concern'
import { TokenTypes } from '../enums/TokenTypes'
import { Account } from '@prisma/client'
import emailService from './email.service'

const loginAccountWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  const account = await accountService.getAccountByEmail(email)
  if (!account || !(await accountConcerns.isPasswordMatch(account, password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password')
  }
  return account
}

const logout = async (refreshToken: string) => {
  const token = await prisma.token.findFirst({
    where: {
      token: refreshToken,
      type: TokenTypes.REFRESH,
      blacklisted: false
    }
  })

  if (!token) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found')
  }

  await prisma.token.delete({
    where: {
      id: token.id
    }
  })
}

const refreshAuth = async (refreshToken: string) => {
  try {
    const token = await tokenService.verifyToken(
      refreshToken,
      TokenTypes.REFRESH
    )
    const account = await accountService.getAccountById(token.account.id)

    if (!account) throw new Error('Account not found')

    await prisma.token.delete({
      where: {
        id: token.id
      }
    })

    return tokenService.generateAuthTokens(account)
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate')
  }
}

const changePassword = async (
  requesterUser: Account,
  password: string,
  newPassword: string
) => {
  if (!requesterUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found')
  }

  const isPasswordMatch = await accountConcerns.isPasswordMatch(
    requesterUser,
    password
  )

  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password do not match')
  }

  await accountService.updatePassword(newPassword, requesterUser.id)
}

const resetPassword = async (
  code: number,
  email: string,
  newPassword: string
) => {
  const account = await accountService.getAccountByEmail(email)

  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found')
  }

  const isCodeValid = await accountConcerns.isCodeValid(account.id, code)

  const { password_reset_tries } = await prisma.account.update({
    where: { id: account.id },
    data: { password_reset_tries: Number(account.password_reset_tries) - 1 }
  })

  if (!isCodeValid) {
    if (password_reset_tries && password_reset_tries > 0) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        `Invalid code ${password_reset_tries} tries left`
      )
    } else if (Number(password_reset_tries) <= 0) {
      const { code } = await generatePasswordCode(account.email)

      await emailService.sendResetPasswordCode(account.email, code)

      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        `Max tries reached other code send in your email`
      )
    } else {
      throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid code`)
    }
  }

  await accountService.updatePassword(newPassword, account.id)
}

const generatePasswordCode = async (email: string) => {
  const account = await accountService.getAccountByEmail(email)

  if (!account) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'No accounts found with this email'
    )
  }

  const codeData = await accountService.generateNewPasswordCode(account)

  return codeData
}

export default {
  loginAccountWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  generatePasswordCode,
  changePassword
}
