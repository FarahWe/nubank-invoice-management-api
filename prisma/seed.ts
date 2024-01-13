import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import logger from '../src/config/logger'

const prisma = new PrismaClient()

const seeder = async () => {
  const hashPassword = await bcrypt.hash('39601210', await bcrypt.genSalt())

  const account = await prisma.account.create({
    data: {
      name: 'Wirdo',
      phone: '4939601210',
      password: hashPassword,
      email: 'info@wirdo.com.br',
      role: 'superuser'
    }
  })

  logger.info('---------user created!----------')
  logger.info(`Email: ${account.email}`)
  logger.info(`Passwrod: 39601210`)
  logger.info('--------------------------------')
}

seeder()
