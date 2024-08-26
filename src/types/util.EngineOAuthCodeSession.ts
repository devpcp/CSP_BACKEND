/**
 * An interface of in-memory database from session on "Code" via OAuth
 */
export interface IInMemoryDBOAuthCodeObjectSession<T = {}, C = any> {
    [variableKey: string]: IInMemoryDBOAuthCodeObjectSessionModel<C> & T
}

/**
 * An interface Model of in-memory database from session on "Code" via OAuth
 */
export interface IInMemoryDBOAuthCodeObjectSessionModel<C> {
    /**
     * A sessionId
     */
    code: string;
    /**
     * A field of "client_id" from model "OAuth"
     */
    client_id: string;
    /**
     * A field of "client_secret" from model "OAuth"
     */
    client_secret: string;
    /**
     * An expiry time left of this session (in second)
     */
    expirationTime: number;
    /**
     * An instance of interval to handle session
     */
    intervalPointer: NodeJS.Timer;
    /**
     * A class instance of "COAuthCodeSession"
     */
    instance: C;
}