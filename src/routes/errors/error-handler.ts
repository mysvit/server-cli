import { environment } from '@env'
import { ErrorBase, ErrorsMsg, StringHelper } from '@shared'
import { randomUUID } from 'crypto'
import { NextFunction, Request, RequestHandler, Response } from "express"
import { StatusCodes } from 'http-status-codes'
import { logger } from '../ref/logger'

export class ErrorHandler {

    // log error and send them if needed
    static async logErrors(error: Error): Promise<void> {
        await logger.error(ErrorsMsg.CentralizedError, error)
        // await sendMailToAdminIfCritical()
        // await sendEventsToSentry()
    }

    // wrap all api method in try catch
    static apiCatch(fn: RequestHandler) {
        return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                await fn(req, res, next)
            } catch (error) {
                next(error)
            }
        }
    }

    // api error handler middleware
    static async apiHandler(err: ErrorBase, req: Request, res: Response, next: NextFunction) {
        err.errorId = randomUUID()
        await ErrorHandler.logErrors(err)
        if (err.isOperational) {
            res.status(err.statusCode)
            res.send({message: err.message})
        } else {
            const message = 'Unknown error, see server log'
            res.status(StatusCodes.INTERNAL_SERVER_ERROR)
            res.send(environment.production
                ? {message: message, errorId: err.errorId}
                : {message: message, stack: err.stack}
            )
        }
    }

    // not found route
    static api404(req: Request, res: Response, next: NextFunction) {
        res.status(StatusCodes.NOT_FOUND).send({message: StringHelper.format(ErrorsMsg.RouteNotFound, req.originalUrl)})
    }

}
