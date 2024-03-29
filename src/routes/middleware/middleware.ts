import { environment } from '@env'
import { ApiParams, ErrorsMsg, ValueHelper } from '@shared'
import { NextFunction, Request, Response } from "express"
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'

const {verify} = jwt

export namespace Middleware {

    // Check header if userId sent. If exist check Authentication
    export function verifyUserId(req: Request, res: Response, next: NextFunction) {
        // verify token and user_id
        const userId = req.headers[ApiParams.user_id]
        if (!ValueHelper.isEmpty(userId)) {
            try {
                const token = (<string>(req.headers[ApiParams.authorization] || '')).replace('Bearer ', '')
                const verifyResult = verify(token, environment.token_key)
                if (userId !== verifyResult.user_id) {
                    req.headers[ApiParams.user_id] = undefined
                }
            } catch (err) {
                req.headers[ApiParams.user_id] = undefined
            }
        }
        next()
    }

    export function verifyToken(req: Request, res: Response, next: NextFunction) {
        // verify token and user_id
        const userId = req.headers[ApiParams.user_id]
        const token = (<string>(req.headers[ApiParams.authorization] || '')).replace('Bearer ', '')
        if (ValueHelper.isEmpty(token) || ValueHelper.isEmpty(userId)) {
            return res.status(StatusCodes.FORBIDDEN).send({message: ErrorsMsg.TokenRequired})
        }
        try {
            const verifyResult = verify(token, environment.token_key)
            if (userId !== verifyResult.user_id) {
                return res.status(StatusCodes.UNAUTHORIZED).send({message: ErrorsMsg.InvalidToken})
            }
        } catch (err) {
            return res.status(StatusCodes.UNAUTHORIZED).send({message: ErrorsMsg.InvalidToken})
        }
        next()
    }

}
