import {FastifyRequest, FastifyReply} from "fastify"
import { Transaction } from "sequelize/types/transaction"


export interface FastifyRequestDefault<T = {}> extends FastifyRequest<T> {
    /**
     * A user id from request (String UUID)
     */
    id: string;
    transaction?: Transaction
}

export interface FastifyReplyDefault extends FastifyReply {

}

export interface FastifyOptionDefault {
    currentDateTime?: Date;
    transaction?: Transaction;
}