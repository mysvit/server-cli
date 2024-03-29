import { DbConnection } from '@env'
import { ErrorApi500, ErrorsMsg } from '@shared'
import { Connection, createPool, Pool, PoolConnection, QueryOptions } from 'mariadb'
import { SqlBuilder } from './sql-builder'

export class Db {

    // conn: Pool
    table: string = ''

    static createPool(dbConfig: DbConnection) {
        return createPool(dbConfig)
    }

    static transactionCatch(fn: Function) {
        return async function <T>(conn: PoolConnection): Promise<T> {
            try {
                await conn.beginTransaction()
                return await fn(conn)
            } catch (e) {
                await conn.rollback()
                throw new ErrorApi500(ErrorsMsg.ErrorExecutingDbScript)
            } finally {
                await conn.commit()
                await conn.end()
            }
        }
    }

    constructor(public conn: Connection | PoolConnection | Pool) {
    }

    async selectOne<T>(whereObj): Promise<T> {
        const sel = SqlBuilder.selectOneBuilder(this.table, whereObj)
        return this.conn.query(sel.sql, sel.values)
            .then(data => data.length > 0 ? data[0] : undefined)
    }

    async dbQuery(sql: string | QueryOptions, values?: any): Promise<any> {
        // const conn = await this.getConnection
        // try {
        //     return conn.query(sql, values)
        // } finally {
        //     if (conn) await conn.release()
        // }
    }

    async dbExecute(sql: string | QueryOptions, values?: any): Promise<any> {
        // const conn = await this.getConnection
        // let result = {affectedRows: undefined}
        // try {
        //     result = await conn.execute(sql, values)
        // } finally {
        //     if (conn) await conn.end()
        // }
        // return result
    }

    async insert<T>(obj: T): Promise<number> {
        const ins = SqlBuilder.insertBuilder(this.table, obj)
        return this.conn.query(ins.sql, ins.values)
            .then(data => data.affectedRows)
    }

    async select<T>(obj: T, whereObj: T): Promise<T> {
        const sel = SqlBuilder.selectBuilder(this.table, obj, whereObj)
        return this.conn.query(sel.sql, sel.values)
            .then(data => data ? data[0] : undefined)
    }

    async update(updateObj: Object, whereObj: Object): Promise<number> {
        const upd = SqlBuilder.updateBuilder(this.table, updateObj, whereObj)
        return this.conn.query(upd.sql, upd.values)
            .then(data => data.affectedRows)
    }

    async delete(whereObj: Object): Promise<number> {
        const del = SqlBuilder.deleteBuilder(this.table, whereObj)
        return this.conn.query(del.sql, del.values)
            .then(data => data.affectedRows)
    }

}

