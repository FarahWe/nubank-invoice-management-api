import { Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'
import {
  NuLoginCodeCertificateBody,
  NuRequestCodeCertificateBody
} from '../@types/controllers/nubank.controller.type'
import { CustomData } from '../@types/controllers/tc.request'
import { bankConnectionService, nubankService } from '../services'
import ApiError from '../utils/ApiError'
import httpStatus from 'http-status'
import { NubankApi } from 'nubank-api'
import { BankTypes } from '../enums/BankTypes'

const authenticateWithRefreshToken = catchAsync(
  async (
    req: Request<null, null, { refreshToken: string }> & CustomData,
    res: Response
  ) => {
    const { refreshToken: _refreshToken } = req.body

    const nuConnection =
      await bankConnectionService.getConnectionByRefreshTokenAndType(
        req.account.id,
        _refreshToken,
        BankTypes.NUBANK
      )

    if (!nuConnection?.cert) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Bank connection not found')
    }

    const nuApi = new NubankApi({
      clientName: 'invoice-management',
      env: 'node',
      cert: nuConnection?.cert
    })

    await nuApi.auth.authenticateWithRefreshToken(_refreshToken)

    const { accessToken, refreshToken } = nuApi.authState

    if (!accessToken || !refreshToken) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Cannot authenticate')
    }

    await nubankService.createOrUpdateNubankConnection(
      req.account.id,
      accessToken,
      refreshToken
    )

    res.json(nuApi.authState)
  }
)

const authenticateWithCodeCertificate = catchAsync(
  async (
    req: Request<null, null, NuLoginCodeCertificateBody> & CustomData,
    res: Response
  ) => {
    const { code, cpf, password } = req.body

    const nuApi = new NubankApi({
      clientName: 'invoice-management',
      env: 'node'
    })

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

    const { accessToken, refreshToken } = nuApi.authState

    if (!accessToken || !refreshToken) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Cannot authenticate')
    }

    await nubankService.createOrUpdateNubankConnection(
      req.account.id,
      accessToken,
      refreshToken,
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

    const nuApi = new NubankApi({
      clientName: 'invoice-management',
      env: 'node'
    })

    const email = await nuApi.auth.requestAuthenticationCode({
      cpf,
      password,
      deviceId: req.account.name
    })

    res.json({ message: `Code sent to ${email}` })
  }
)

const getCardFeed = catchAsync(async (req: Response, res: Response) => {
  // TODO: fazer authentication
  const nuApi = new NubankApi({
    clientName: 'invoice-management',
    env: 'node'
  })

  const cardsTransactions = await nuApi.card.getFeed()

  res.json(cardsTransactions)
})

const getNuAccount = catchAsync(async (req: Response, res: Response) => {
  // TODO: fazer authentication
  const nuApi = new NubankApi({
    clientName: 'invoice-management',
    env: 'node'
  })
  const account = await nuApi.account.me()

  res.json(account)
})

const getNuBalance = catchAsync(async (req: Response, res: Response) => {
  // TODO: fazer authentication
  const nuApi = new NubankApi({
    clientName: 'invoice-management',
    env: 'node'
  })
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
