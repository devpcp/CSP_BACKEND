/**
 * A default of jwt token where defined in this API app
 *
 *
 * if you want to add more claims, please check this url below
 * @see https://www.iana.org/assignments/jwt/jwt.xhtml#claims
 */
export type IJwtPayloadDefault<T = {}> = T & ISchemaJwtPayloadDefault;

export interface ISchemaJwtPayloadDefault {
    /**
     * JWT ID (jti)
     * - Unique identifier that can be used to prevent the JWT from being replayed
     */
    jti: string;
    /**
     * Issuer (iss)
     * - URL who is generated this jwt
     */
    iss: string;
    /**
     * Subject (sub)
     * - User who is owner of this access_token (mean that who is login to get this token)
     */
    sub: string;
    /**
     * Audience (aud)
     * - URL who is asked to this jwt
     */
    aud: string;
    /**
     * Issued At (iat)
     * - Created date of this access_token
     */
    iat: number;
    /**
     * Expiration Time (exp)
     * - Use this access_token before expired at this time
     */
    exp: number;
    /**
     * Scope Values (scope)
     * - defined from is "inside" ("default") or "outside" ("guest")
     */
    scope: "default" | "guest";
    /**
     * Client Identifier (client_id) use when "scope" is "guest"
     */
    client_id: string;
}
