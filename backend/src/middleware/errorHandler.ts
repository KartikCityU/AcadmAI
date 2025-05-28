import { Request, Response, NextFunction } from 'express'

interface CustomError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err)

  // Default error
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'

  // Prisma errors
  if (err.message.includes('Unique constraint')) {
    statusCode = 400
    message = 'This record already exists'
  }

  if (err.message.includes('Record to update not found')) {
    statusCode = 404
    message = 'Record not found'
  }

  // JWT errors
  if (err.message.includes('jwt malformed') || err.message.includes('invalid token')) {
    statusCode = 401
    message = 'Invalid token'
  }

  if (err.message.includes('jwt expired')) {
    statusCode = 401
    message = 'Token expired'
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}
