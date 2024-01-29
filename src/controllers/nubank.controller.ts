import { Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'
import {
  NuLoginCodeCertificateBody,
  NuRequestCodeCertificateBody
} from '../@types/controllers/nubank.controller.type'
import nuApi from '../config/nubank-api'
import { CustomData } from '../@types/controllers/tc.request'

const authenticateWithRefreshToken = catchAsync(
  async (
    req: Request<null, null, { refreshToken: string }> & CustomData,
    res: Response
  ) => {
    const { refreshToken } = req.body

    await nuApi.auth.authenticateWithRefreshToken(refreshToken)

    res.json(nuApi.authState)
  }
)

const authenticateWithCodeCertificate = catchAsync(
  async (
    req: Request<null, null, NuLoginCodeCertificateBody> & CustomData,
    res: Response
  ) => {
    const { code, cpf, password } = req.body

    const certificates = await nuApi.auth.exchangeCertificates({
      cpf,
      password,
      deviceId: req.account.name,
      authCode: code
    })

    await nuApi.auth.authenticateWithCertificate(
      cpf,
      password,
      certificates.cert
    )

    res.json(nuApi.authState)
  }
)

const generateCode = catchAsync(
  async (
    req: Request<null, null, NuRequestCodeCertificateBody> & CustomData,
    res: Response
  ) => {
    const { cpf, password } = req.body

    const email = await nuApi.auth.requestAuthenticationCode({
      cpf,
      password,
      deviceId: req.account.name
    })

    res.json({ message: `Code sent to ${email}` })
  }
)

const getCardFeed = catchAsync(async (req: Response, res: Response) => {
  const cardsTransactions = await nuApi.card.getFeed()

  res.json(cardsTransactions)
})

const getNuAccount = catchAsync(async (req: Response, res: Response) => {
  const account = await nuApi.account.me()

  res.json(account)
})

const getNuBalance = catchAsync(async (req: Response, res: Response) => {
  const balance = await nuApi.account.getBalance()

  res.json(balance)
})

export default {
  authenticateWithCodeCertificate,
  authenticateWithRefreshToken,

  generateCode,
  getCardFeed,
  getNuAccount,
  getNuBalance
}
