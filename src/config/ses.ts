import { SESClient } from '@aws-sdk/client-ses'
import config from './config'

const sesClient = new SESClient({
  credentials: {
    accessKeyId: config.aws.s3.accessKey,
    secretAccessKey: config.aws.s3.secretKey
  },
  region: config.aws.region
})

export default sesClient
