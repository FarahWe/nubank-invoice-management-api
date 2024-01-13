import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import logger from '../src/config/logger'

const prisma = new PrismaClient()

const seeder = async () => {
  const hashPassword = await bcrypt.hash('123456', await bcrypt.genSalt())

  const account = await prisma.account.create({
    data: {
      name: 'Admin',
      password: hashPassword,
      email: 'admin@admin.com',
      role: 'superuser'
    }
  })

  logger.info('---------user created!----------')
  logger.info(`Email: ${account.email}`)
  logger.info(`Passwrod: 123456`)
  logger.info('--------------------------------')
}

seeder()
