import { SendEmailCommand } from '@aws-sdk/client-ses'
import { resetPasswordCodeHtml } from '../views/resetPasswordCodeHtml'
import { sendEmailQueue } from '../queues/sendEmail.queue'
import { jobNames } from '../config/bullmq'

const sendEmail = async (command: SendEmailCommand) => {
  // await sesClient.send(command)
}

const sendResetPasswordCode = async (to: string, code: number) => {
  sendEmailQueue.add(jobNames.sendEmail, {
    subject: 'GDT - Código de recuperação de senha',
    to,
    htmlData: resetPasswordCodeHtml(code)
  })
}

export default {
  sendEmail,
  sendResetPasswordCode
}
