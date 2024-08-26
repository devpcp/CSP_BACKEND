/**
 * A Type of function-utilFastifyResponseJson
 */
export type IUtilFastifyResponseJsonFieldStatus = "success" | "failed";

/**
 * An Interface of function-utilFastifyResponseJson
 */
export interface IUtilFastifyResponseJson<T> {
    status: IUtilFastifyResponseJsonFieldStatus,
    data: T
}