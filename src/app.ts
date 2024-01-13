import express from 'express'
import morgan from './config/morgan'
import passport from 'passport'
import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import { jwtStrategy } from './config/passport'
import { authLimiter } from './middlewares/rateLimiter'
import v1Router from './routes/v1'
import ApiError from './utils/ApiError'
import httpStatus from 'http-status'
import { errorConverter, errorHandler } from './middlewares/error'
import config from './config/config'
import swagger from 'swagger-ui-express'

const app = express()

if (config.env !== 'test') {
  app.use(morgan.successHandler)
  app.use(morgan.errorHandler)
}

// set security HTTP headers
app.use(helmet())

// parse json request body
app.use(express.json())

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }))

// sanitize request data
// app.use(xss());

// gzip compression
app.use(compression())

// enable cors
app.use(cors())
app.options('*', cors())

// jwt authentication
app.use(passport.initialize())
passport.use('jwt', jwtStrategy)

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter)
}

// v1 api routes
app.use('/v1', v1Router)

// app.use('/api-docs', swagger.serve, swagger.setup(swaggerDocument))

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'))
})

// convert error to ApiError, if needed
app.use(errorConverter)

// handle error
app.use(errorHandler)

export default app
