import express from 'express'
import auth from '../../middlewares/auth'
import validate from '../../middlewares/validate'
import accountValidation from '../../validations/account.validation'
import accountController from '../../controllers/account.controller'
import { permissions } from '../../config/roles'

const routerAccounts = express.Router()

routerAccounts
  .route('/')
  .post(
    auth(permissions.manageAccounts),
    validate(accountValidation.createAccount),
    accountController.createAccount
  )
  .get(
    auth(permissions.getAccounts),
    validate(accountValidation.getAccounts),
    accountController.getAccounts
  )

routerAccounts
  .route('/:account_id')
  .get(
    auth(permissions.getAccounts),
    validate(accountValidation.getAccount),
    accountController.getAccount
  )
  .put(
    // removed permissions beacause any user can edit your own account
    // the permission are insite the controller
    auth(),
    validate(accountValidation.updateAccount),
    accountController.updateAccount
  )
  .delete(
    auth(permissions.manageAccounts),
    validate(accountValidation.deleteAccount),
    accountController.deleteAccount
  )

export default routerAccounts
