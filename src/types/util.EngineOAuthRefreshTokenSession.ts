/**
 * An interface of in-memory database from session on "refresh_token" via OAuth
 */
export interface IInMemoryDBOAuthRefreshTokenObjectSession<T = {}, C = any> {
    [variableKey: string]: IInMemoryDBOAuthRefreshTokenObjectSessionModel<C> & T
}

/**
 * An interface Model of in-memory database from session on "refresh_token" via OAuth
 */
export interface IInMemoryDBOAuthRefreshTokenObjectSessionModel<C = any> {
    /**
     * A sessionId refer OAuth "refresh_token"
     */
    refresh_token: string;
    /**
     * A sessionId of OAuth "Code Session"
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
     * A field of "user_id" from model "OAuth"
     */
    user_id: string;
    /**
     * An expiry time left of this session (in second)
     */
    expirationTime: number;
    /**
     * An instance of interval to handle session
     */
    intervalPointer: NodeJS.Timer;
    /**
     * A class instance of "COAuthRefreshTokenSession"
     */
    instance: C;
}