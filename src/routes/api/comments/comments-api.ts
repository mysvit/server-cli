import { ParamsHelper } from '@shared'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { commentsCore } from '../../ref/db-pools-core'

export class CommentsApi {

    static async add(req: Request, res: Response) {
        const result = await commentsCore.add(ParamsHelper.getUserId(req.headers), req.body)
        res.status(StatusCodes.OK).json(result)
    }

    static async upd(req: Request, res: Response) {
        const result = await commentsCore.upd(ParamsHelper.getUserId(req.headers), req.body)
        res.status(StatusCodes.OK).json(result)
    }

    static async del(req: Request, res: Response) {
        const result = await commentsCore.del(ParamsHelper.getUserId(req.headers), req.params?.id)
        res.status(StatusCodes.OK).json(result)
    }

    static async get(req: Request, res: Response) {
        const result = await commentsCore.get(req.params?.id)
        res.send(result)
    }

    static async list(req: Request, res: Response) {
        const result = await commentsCore.list(ParamsHelper.getUserId(req.headers), req.body)
        res.status(StatusCodes.OK).json(result)
    }

    static async listCount(req: Request, res: Response) {
        const result = await commentsCore.listCount(ParamsHelper.getUserId(req.headers), req.body)
        res.status(StatusCodes.OK).json(result)
    }
}
