import {Error} from "sequelize";

export type IhandlerLogData = [
    [
        ILogRequestAction,
        ILogRequestIdOrParamId?,
        ILogRequestBody?,
        ILogDataBeforeUpdate?
    ],
    ILogSystemError
]

/**
 * this is
 */
type ILogRequestAction = string
type ILogRequestIdOrParamId = string
type ILogRequestBody = any
type ILogDataBeforeUpdate = any
type ILogSystemError = string | Error

