import httpStatus from 'http-status'
import { BankTypes } from '../enums/BankTypes'
import ApiError from '../utils/ApiError'
import bankConnectionService from './bank-connection.service'
import { randomUUID } from 'crypto'

const createOrUpdateNubankConnection = async (
  accountId: string,
  accessToken: string,
  refreshToken: string,
  cert?: Buffer
) => {
  const nubankConnection =
    await bankConnectionService.getConnectionByAccountIdAndType(
      accountId,
      BankTypes.NUBANK
    )

  if (!nubankConnection) {
    if (!cert) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Missing certificate')
    }

    await bankConnectionService.createBankConnection({
      id: randomUUID(),
      account_id: accountId,
      type: BankTypes.NUBANK,
      access_token: accessToken,
      refresh_token: refreshToken,
      cert
    })
  } else {
    await bankConnectionService.updateBankConnection(nubankConnection.id, {
      access_token: accessToken,
      refresh_token: refreshToken,
      ...(cert && { cert })
    })
  }
}

export default { createOrUpdateNubankConnection }
