// import { Job } from 'bullmq'
// import logger from '../config/logger'
// import { SendEmailType } from '../@types/services/email.services.type'
// import { SendEmailCommand } from '@aws-sdk/client-ses'
// import { emailService } from '../services'
// import config from '../config/config'

// export default async (job: Job<SendEmailType>) => {
//   const { htmlData, subject, to } = job.data

//   logger.info(`Running Job ${job.name}`)
//   logger.info(`Job data ${to} ${subject}`)

//   const command = new SendEmailCommand({
//     Source: config.email.from,
//     Destination: {
//       ToAddresses: [to]
//     },
//     Message: {
//       Subject: {
//         Data: subject
//       },
//       Body: {
//         Html: {
//           Data: htmlData
//         }
//       }
//     }
//   })

//   await emailService.sendEmail(command)
// }
