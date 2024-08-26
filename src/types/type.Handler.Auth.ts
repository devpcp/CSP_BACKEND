import { FastifyRequestDefault } from "./type.Default.Fastify";

/**
 * A FastifyRequest contains incoming request from
 */
export type IHandlerLoginRequest = FastifyRequestDefault<ISchemaHandlerLoginRequest>;
/**
 * An interface contains incoming request from
 */
export interface ISchemaHandlerLoginRequest {
    // Headers: {},
    // Params: {},
    // Querystring: {},
    Body: {
        /**
         * Username สำหรับ login
         */
        user_name: string;
        /**
         * Password สำหรับ login
         */
        password: string;
    },
}

/**
 * A FastifyRequest contains incoming request from
 */
export type IHandlerLogoutRequest = FastifyRequestDefault<ISchemaHandlerLogoutRequest>;
/**
 * An interface contains incoming request from
 */
export interface ISchemaHandlerLogoutRequest {
    // Headers: {},
    // Params: {},
    // Querystring: {},
    // Body: {},
}

/**
 * A FastifyRequest contains incoming request from
 */
export type IHandlerAuthAccessTokenRequest = FastifyRequestDefault<ISchemaHandlerAuthAccessTokenRequest>;
/**
 * An interface contains incoming request from
 */
export interface ISchemaHandlerAuthAccessTokenRequest {
    // Headers: {},
    // Params: {},
    // Querystring: {},
    Body: {
        /**
         * ค่า RefreshToken ที่เป็น string<uuid>
         */
        refresh_token: string;
    },
}

/**
 * A FastifyRequest contains incoming request from
 * - [GET] => /api/oauth
 */
export type IHandlerAuthOAuthCodeRequest = FastifyRequestDefault<ISchemaHandlerAuthOAuthCodeRequest>;
/**
 * An interface contains incoming request from
 * - [GET] => /api/oauth
 */
export interface ISchemaHandlerAuthOAuthCodeRequest {
    // Headers: {},
    // Params: {},
    Querystring: {
        /**
         * A field defined Client ID from done of register OAuth
         */
        client_id: string;
        /**
         * A field defined when request is fulfilled, this "redirect_uri" will go to URL as request this field
         */
        redirect_uri: string;
        /**
         * A field defined scope of permission
         * - "default" is to-do issue token use internal application (api/login)
         * - "guest" is to-do issue token use external application (api/oauth)
         */
        scope: "default" | "guest";
    },
    // Body: {}
}

/**
 * A FastifyRequest contains incoming request from
 * - [POST] => /api/oauth/token
 */
export type IHandlerAuthOAuthTokenRequest = FastifyRequestDefault<ISchemaHandlerAuthOAuthTokenRequest>;
/**
 * An interface contains incoming request from
 * - [POST] => /api/oauth/token
 */
export interface ISchemaHandlerAuthOAuthTokenRequest {
    // Headers: {},
    // Params: {},
    // Querystring: {},
    Body: {
        /**
         * Type of actions to do and response to client
         */
        grant_type:  "authorization_code" | "refresh_token";
        /**
         * A Session code id from generated from "OAuthCode"
         */
        code: string;
        /**
         * A field of "client_id" from generated from "OAuthCode" via model "OAuth"
         */
        client_id: string;
        /**
         * A field of "client_secret" from via model "OAuth"
         */
        client_secret: string;
        /**
         * A field of "refresh_token" when need to "grant_type" is "refresh_token"
         */
        refresh_token?: string;
    }
}