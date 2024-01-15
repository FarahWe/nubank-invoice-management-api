import axios from 'axios'
import { randomUUID } from 'crypto'
import { Request, Response } from 'express'
import QRCode from 'qrcode'
import catchAsync from '../utils/catchAsync'
import axiosInstance from '../utils/axios'
import { NubankApi } from 'nubank-api'
import { CustomData } from '../@types/controllers/tc.request'
import {
  NuLoginCodeCertificateBody,
  NuRequestCodeCertificateBody
} from '../@types/controllers/nubank.controller.type'
import { readFile, writeFile } from 'fs/promises'
import { saveCertificate } from '../concerns/shared.concern'

const loginNubankUrl =
  'https://prod-global-webapp-proxy.nubank.com.br/api/proxy/AJxL5LBUC2Tx4PB-W6VD1SEIOd2xp14EDQ.aHR0cHM6Ly9wcm9kLWdsb2JhbC1hdXRoLm51YmFuay5jb20uYnIvYXBpL3Rva2Vu'

const loginWithQrcode =
  'https://prod-global-webapp-proxy.nubank.com.br/api/proxy/AJxL5LD1_tXTsdl5luooo69vWaMYPjMJww.aHR0cHM6Ly9wcm9kLWdsb2JhbC1hdXRoLm51YmFuay5jb20uYnIvYXBpL2xpZnQ'

const nuApi = new NubankApi({
  clientName: 'test-client'
})

const generateQrcode = catchAsync(async (req: Request, res: Response) => {
  const qrcodeUuid = randomUUID()

  QRCode.toString(qrcodeUuid, { type: 'terminal' }, async (err, url) => {
    console.log(url)
  })

  const payload = {
    grant_type: 'password',
    login: '10897472926',
    password: 'Ed45ua62!',
    client_id: 'other.conta',
    client_secret: 'yQPeLzoHuJzlMMSAjC-LgNUJdUecx8XO'
  }

  const { data } = await axios.post(loginNubankUrl, payload)

  console.log(data)

  axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.access_token}`

  // rl.question(
  //   `Generate a QRcode and read with the app: ${qrcodeUuid}`,
  //   async () => {
  //     try {

  //       console.log(data)
  //       console.log('You are authenticated!')

  //       await writeFile('./auth-state.json', JSON.stringify(data)) // Saves the auth data to use later
  //       process.exit(0)
  //     } catch (e) {
  //       console.log(e.response)
  //       console.error(e.stack)
  //     }
  //   }
  // )

  res.json({ qrcode_id: qrcodeUuid })
})

const signInWithQrcode = catchAsync(
  async (req: Request<null, null, { qrcode_id: string }>, res: Response) => {
    const payload = {
      qr_code_id: req.body.qrcode_id,
      type: 'login-webapp'
    }

    const { data } = await axiosInstance.post(loginWithQrcode, payload)

    console.log(data)

    res.json(data)
  }
)

const signInWithCodeCertificate = catchAsync(
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

    await saveCertificate('./cert.p12', certificates.cert)
    await saveCertificate('./cert-crypto.p12', certificates.certCrypto)

    const authCert = await readFile('./cert.p12')

    await nuApi.auth.authenticateWithCertificate(cpf, password, authCert)

    await writeFile('./auth-state-cert.json', JSON.stringify(nuApi.authState))
    console.log('You are authenticated!')
    console.log(nuApi.authState)

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

export default {
  generateQrcode,
  signInWithQrcode,
  signInWithCodeCertificate,
  generateCode
}
