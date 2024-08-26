export interface IInMemoryDBAccessTokenObjectSession<T = {}> {
    intervalPointer: NodeJS.Timer;
    timeoutPointer: NodeJS.Timeout;
    T;
}

export interface IInMemoryDBAccessTokenSession<T = {}> extends IInMemoryDBAccessTokenObjectSession<T> {
}