import express from 'express'
import authRoute from './auth.route'
import accountRoute from './account.route'
import nubankRoute from './nubank.route'

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
  }
]

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route)
})

export default router
