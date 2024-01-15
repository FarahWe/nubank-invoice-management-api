import express from 'express'
import auth from '../../middlewares/auth'
import nubankController from '../../controllers/nubank.controller'

const router = express.Router()

router.post('/generate-qrcode', auth(), nubankController.generateQrcode)

router.post('/login-qrcode', auth(), nubankController.signInWithQrcode)

router.post('/request-code', auth(), nubankController.generateCode)

router.post('/login-code', auth(), nubankController.signInWithCodeCertificate)

export default router
