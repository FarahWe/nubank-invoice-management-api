import express from 'express'
import authRoute from './auth.route'
import accountRoute from './account.route'
import nubankRoute from './nubank.route'
import { serverAdapter } from '../../queues/adpters'

const router = express.Router()

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute
  },
  {
    path: '/accounts',
    route: accountRoute
  },
  {
    path: '/nubank-integrations',
    route: nubankRoute
  },
  {
    path: '/admin/queues',
    route: serverAdapter.getRouter()
  }
]

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route)
})

export default router
