// @ts-ignore
import * as ModelSessions from "../models/Sessions/Sessions";
import { Transaction } from "sequelize";

export type Sessions = typeof ModelSessions;

export type ISessionType = "access_token" | "refresh_token" | "oauth_code";

export interface ICreateSession<T> {
    id: string;
    session_type: ISessionType;
    created_time: Date;
    expiration_time: Date;
    detail: T;
    transaction: Transaction | null;
}

export type createSession = <T>(arg0: ICreateSession<T>) => Promise<Sessions>;

export interface IGetSession {
    id: string;
    session_type: ISessionType;
    transaction: Transaction | null;
}

export type getSession = (arg0: IGetSession) => Promise<Sessions>;