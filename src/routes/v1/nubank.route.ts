import express from 'express'
import nubankController from '../../controllers/nubank.controller'
import auth from '../../middlewares/auth'
import validate from '../../middlewares/validate'
import nubankValidation from '../../validations/nubank.validation'

const router = express.Router()

router.post(
  '/refresh-tokens',
  validate(nubankValidation.refreshTokens),
  auth(),
  nubankController.authenticateWithRefreshToken
)

router.post(
  '/request-code',
  validate(nubankValidation.requestCode),
  auth(),
  nubankController.generateCode
)

router.post(
  '/login-code',
  validate(nubankValidation.authenticateWithCodeCertificate),
  auth(),
  nubankController.authenticateWithCodeCertificate
)

router.get('/me', auth(), nubankController.getNuAccount)

router.get('/balance', auth(), nubankController.getNuBalance)

export default router
