import { NubankApi } from 'nubank-api'

const nuApi = new NubankApi({
  clientName: 'invoice-management',
  env: 'node'
})

export default nuApi
