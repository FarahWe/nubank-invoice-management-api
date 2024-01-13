import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync'
import { authService, tokenService, emailService } from '../services'
import { Request, Response } from 'express'
import {
  LoginBody,
  LogoutBody,
  UpdatePasswordBody
} from '../@types/controllers/auth.controller.type'
import { CustomData } from '../@types/controllers/tc.request'
import accountConcern from '../concerns/account.concern'

const login = catchAsync(
  async (req: Request<null, LoginBody>, res: Response) => {
    const { email, password } = req.body
    const account = await authService.loginAccountWithEmailAndPassword(
      email,
      password
    )
    const tokens = await tokenService.generateAuthTokens(account)

    res.send({
      account: accountConcern.sanitizeAccount(account),
      tokens
    })
  }
)

const logout = catchAsync(
  async (req: Request<null, null, LogoutBody>, res: Response) => {
    await authService.logout(req.body.refreshToken)
    res.status(httpStatus.NO_CONTENT).send()
  }
)

const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken)
  res.send({ ...tokens })
})

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { code } = await authService.generatePasswordCode(req.body.email)

  await emailService.sendResetPasswordCode(req.body.email, code)
  res.status(httpStatus.NO_CONTENT).send()
})

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await authService.resetPassword(
    req.body.code,
    req.body.email,
    req.body.password
  )
  res.status(httpStatus.NO_CONTENT).send()
})

const changePassword = catchAsync(
  async (
    req: Request<null, null, UpdatePasswordBody> & CustomData,
    res: Response
  ) => {
    await authService.changePassword(
      req.account,
      req.body.password,
      req.body.newPassword
    )
    res.status(httpStatus.NO_CONTENT).send()
  }
)

export default {
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  changePassword
}
