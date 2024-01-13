import { config } from 'dotenv'

import { resetDatabase } from './reset-db'

config({ path: '.env.test', override: true })

afterAll(async () => {
  await resetDatabase()
})
