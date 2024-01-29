import express from 'express'
import nubankController from '../../controllers/nubank.controller'
import auth from '../../middlewares/auth'

const router = express.Router()

router.post(
  '/refresh-tokens',
  auth(),
  nubankController.authenticateWithRefreshToken
)

router.post('/request-code', auth(), nubankController.generateCode)

router.post(
  '/login-code',
  auth(),
  nubankController.authenticateWithCodeCertificate
)

router.get('/me', auth(), nubankController.getNuAccount)

router.get('/balance', auth(), nubankController.getNuBalance)

export default router
