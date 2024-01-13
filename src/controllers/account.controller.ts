import accountConcerns from '../concerns/account.concern'
import httpStatus from 'http-status'
import ApiError from '../utils/ApiError'
import catchAsync from '../utils/catchAsync'
import { accountService } from '../services'
import { Request, Response } from 'express'
import {
  RegisterBody,
  UpdateBody
} from '../@types/controllers/auth.controller.type'
import { AccountsQuery } from '../@types/controllers/account.controller.type'
import { normalizeSort } from '../concerns/shared.concern'
import { UUID } from 'crypto'
import config from '../config/config'
import { CustomData } from '../@types/controllers/tc.request'
import { OptionsAccountQuery } from '../services/account.service'
import { RoleTypes } from '../enums/RoleTypes'

const createAccount = catchAsync(
  async (
    req: Request<null, null, RegisterBody> & CustomData,
    res: Response
  ) => {
    const accountData = req.body
    const account = await accountService.createAccount(accountData)

    res
      .status(httpStatus.CREATED)
      .send(accountConcerns.sanitizeAccount(account))
  }
)

const getAccounts = catchAsync(
  async (
    req: Request<null, null, null, AccountsQuery> & CustomData,
    res: Response
  ) => {
    const supportedSortFields = ['name', 'email']
    const sort = normalizeSort(supportedSortFields, req.query.sortBy) as any
    const _limit = Number(req.query.limit ?? config.pagination.limit)
    const selectedPage = Number(req.query.page ?? 0)

    const findOptions: OptionsAccountQuery = {
      where: {
        AND: [
          {
            name: {
              contains: req.query.name // Case-insensitive search
            }
          },
          {
            email: {
              contains: req.query.email // Case-insensitive search
            }
          },
          {
            role: req.query.role
          }
        ]
      },
      orderBy: [
        ...sort,
        {
          created_at: 'asc'
        }
      ]
    }

    const [accounts, totalCount, totalPages, limit, page, hasMore] =
      await accountService.queryAccounts(findOptions, _limit, selectedPage)

    res.send({
      meta: {
        totalCount,
        totalPages,
        limit,
        page,
        hasMore
      },
      data: accountConcerns.sanitizeAccounts(accounts)
    })
  }
)

const getAccount = catchAsync(
  async (req: Request<{ account_id: string }> & CustomData, res: Response) => {
    const account = await accountService.getAccountById(req.params.account_id)

    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Account not found')
    }

    res.send(accountConcerns.sanitizeAccount(account))
  }
)

const updateAccount = catchAsync(
  async (
    req: Request<{ account_id: UUID }, UpdateBody> & CustomData,
    res: Response
  ) => {
    const account = await accountService.getAccountById(req.params.account_id)

    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Account not found')
    }

    if (
      req.account.role !== RoleTypes.SUPERUSER &&
      account.id !== req.account.id
    ) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Can not update different accounts'
      )
    }

    const updatedAccount = await accountService.updateAccountById(
      account,
      req.body,
      req.account
    )

    res.send(accountConcerns.sanitizeAccount(updatedAccount))
  }
)

const deleteAccount = catchAsync(
  async (req: Request<{ account_id: string }> & CustomData, res: Response) => {
    const account = await accountService.getAccountById(req.params.account_id)

    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Account not found')
    }

    await accountService.deleteAccountById(account)
    res.status(httpStatus.NO_CONTENT).send()
  }
)

export default {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount
}
