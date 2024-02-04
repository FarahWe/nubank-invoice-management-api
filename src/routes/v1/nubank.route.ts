import express from 'express'
import nubankController from '../../controllers/nubank.controller'
import auth from '../../middlewares/auth'
import validate from '../../middlewares/validate'
import nubankValidation from '../../validations/nubank.validation'
import authNubank from '../../middlewares/authNubank'

const router = express.Router()

router.post(
  '/refresh-tokens',
  validate(nubankValidation.refreshTokens),
  auth(),
  authNubank(),
  nubankController.authenticateWithRefreshToken
)

router.post(
  '/request-code',
  validate(nubankValidation.requestCode),
  auth(),
  authNubank(),
  nubankController.generateCode
)

router.post(
  '/login-code',
  validate(nubankValidation.authenticateWithCodeCertificate),
  auth(),
  authNubank(),
  nubankController.authenticateWithCodeCertificate
)

router.get('/me', auth(), authNubank(), nubankController.getNuAccount)

router.get('/balance', auth(), authNubank(), nubankController.getNuBalance)

export default router
