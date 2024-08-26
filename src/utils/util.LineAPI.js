const {
    config_line_login_api_channel_id,
    config_line_login_api_channel_secret,
    config_line_login_api_callback_url,
} = require("../config");
const uuid = require("uuid");
const { isPlainObject, get, isString } = require("lodash");
const { isUUID } = require("./generate");


const LINE_LOGIN_API_CHANNEL_ID = config_line_login_api_channel_id;
const LINE_LOGIN_API_CHANNEL_SECRET = config_line_login_api_channel_secret;
const LINE_LOGIN_API_CALLBACK_URL = config_line_login_api_callback_url;

/**
 * An object that stores the session state of the user using LINE Login.
 * @type {Object.<string, { sessionId: string, redirect_uri: string | null, timeoutInstance: NodeJS.Timeout }>}
 */
const lineSessionState = {};

/**
 * > It creates a session state object with a unique sessionId and a timeoutInstance that will delete the session state
 * object after 5 minutes
 * @param [options] - An object that contains the following parameters:
 * @param [options.redirect_uri] - The callback URL that will be used to redirect.
 * @return {object} - The session state object
 */
const createLineSessionState = async (options = {}) => {
    const sessionId = get(options, "sessionId", uuid.v4());

    const retry = get(options, "retry", 20);

    const redirect_uri = get(options, "redirect_uri", null);

    if (retry < 0) {
        throw new Error("createLineSessionState is out of retry");
    }

    if (isPlainObject(lineSessionState[sessionId])) {
        return await new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    const sessionState = await createLineSessionState({
                        ...options,
                        sessionId: uuid.v4(),
                        retry: retry - 1
                    });
                    resolve(sessionState);
                } catch (err) {
                    reject(err);
                }
            }, 1000 * 3);
        });
    }
    else {
        lineSessionState[sessionId] = {
            sessionId: sessionId,
            redirect_uri: redirect_uri,
            timeoutInstance: setTimeout(() => {
                delete lineSessionState[sessionId];
            }, 1000 * 60 * 5)
        };

        return lineSessionState[sessionId];
    }
};


/**
 * It deletes a line session state object by its session ID
 * @param {string} [sessionId] - The session ID of the session to be deleted.
 * @returns {string|null} The sessionId is being returned.
 */
const deleteLineSessionStateById = (sessionId = '') => {
    if (!isUUID(sessionId)) {
        return null;
    }
    else if (!isPlainObject(lineSessionState[sessionId])) {
        return null;
    }
    else {
        clearTimeout(lineSessionState[sessionId].timeoutInstance);
        delete lineSessionState[sessionId];
        return sessionId;
    }
};

/**
 * It creates a URL that will redirect the user to the LINE Login page
 * @param {string|null} [redirect_uri=null] - The callback URL that will be used to redirect.
 * @returns A URL that is used to redirect the user to the LINE Login page.
 */
const lineAPICreateLogin = async (redirect_uri = null) => {
    const lineLoginOAuthURL = new URL('https://access.line.me/oauth2/v2.1/authorize');
    lineLoginOAuthURL.searchParams.set('response_type', 'code');
    lineLoginOAuthURL.searchParams.set('client_id', LINE_LOGIN_API_CHANNEL_ID);
    lineLoginOAuthURL.searchParams.set('redirect_uri', LINE_LOGIN_API_CALLBACK_URL);
    lineLoginOAuthURL.searchParams.set('state', await createLineSessionState({ redirect_uri: redirect_uri }).then(r => r.sessionId));
    lineLoginOAuthURL.searchParams.set('scope', 'profile');

    return lineLoginOAuthURL.href;
};


/**
 * It takes in an app object, a code, and a state, and returns a promise that resolves to an object containing the access
 * token
 * @param {import("fastify").FastifyInstance} [app=null] - The app object that contains the axios instance.
 * @param {string} [code] - The authorization code returned from the initial request to the /oauth2/v2.1/authorize endpoint.
 * @param {string} [state] - The state value that was returned in the previous step.
 * @returns The Line access token
 */
const lineAPIGetAccessToken = async (app = null, code = '', state = '') => {
    if (!app) {
        throw Error("app is not defined");
    }
    else if (!get(app, "axios", null)) {
        throw Error('app.axios is not defined');
    }
    else if (!isString(code) || code.length === 0) {
        throw Error("code is not string");
    }
    else if (!isString(state) || state.length === 0) {
        throw Error("state is not string");
    }
    else if (!isPlainObject(lineSessionState[state])) {
        throw Error("state is not valid");
    }
    else {
        /**
         * @type {import("axios").AxiosInstance}
         */
        const axios = app.axios;

        /**
         * @type {import("axios").AxiosRequestConfig}
         */
        const config = {
            method: 'POST',
            url: 'https://api.line.me/oauth2/v2.1/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        const body = {
            'redirect_uri': LINE_LOGIN_API_CALLBACK_URL,
            'client_id': LINE_LOGIN_API_CHANNEL_ID,
            'client_secret': LINE_LOGIN_API_CHANNEL_SECRET,
            'grant_type': 'authorization_code',
            'code': code
        };

        const data = new URLSearchParams();
        data.append('redirect_uri', body.redirect_uri);
        data.append('client_id', body.client_id);
        data.append('client_secret', body.client_secret);
        data.append('grant_type', body.grant_type);
        data.append('code', body.code);

        /**
         * @type {import("axios").AxiosResponse<import("../types/type.LineAPI").LineAPIResponseToken>}
         */
        const response = await axios({ ...config, data: data });

        if (isString(get(lineSessionState[state], "redirect_uri", null))) {
            if (lineSessionState[state].redirect_uri.length <= 0) {
                deleteLineSessionStateById(state);
            }
        }

        return response.data;
    }
};


/**
 * It revokes the LINE access token.
 * @param {import("fastify").FastifyInstance} [app=null] app - The app object that you created in the previous step.
 * @param {string} [access_token] - The access token to be revoked.
 * @returns The response from the API call.
 */
const lineAPIRevokeAccessToken = async (app = null, access_token = '') => {
    if (!app) {
        throw Error("app is not defined");
    }
    else if (!get(app, "axios", null)) {
        throw Error('app.axios is not defined');
    }
    else if (!isString(access_token) || access_token.length === 0) {
        throw Error("access_token is not string");
    }
    else {
        /**
         * @type {import("axios").AxiosInstance}
         */
        const axios = app.axios;

        /**
         * @type {import("axios").AxiosRequestConfig}
         */
        const config = {
            method: 'POST',
            url: 'https://api.line.me/oauth2/v2.1/revoke',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        const body = {
            'access_token': access_token,
            'client_id': LINE_LOGIN_API_CHANNEL_ID,
            'client_secret': LINE_LOGIN_API_CHANNEL_SECRET
        };

        const data = new URLSearchParams();
        data.append('access_token', body.access_token);
        data.append('client_id', body.client_id);
        data.append('client_secret', body.client_secret);

        const response = await axios({ ...config, data: data })
            .then(r => null)
            .catch(e => null);

        return response;
    }
};


/**
 * A function that gets the user profile from the LINE API.
 * @param {import("fastify").FastifyInstance} [app=null] - The app object that you created in the previous step.
 * @param {string} [access_token] - The access token you received from the LINE Login v2 API.
 * @returns The user profile of the user who is using the LINE app.
 */
const lineAPIGetUserProfile = async (app = null, access_token = '') => {
    if (!isString(access_token) || access_token.length === 0) {
        throw Error("access_token is not string");
    }
    else {
        /**
         * @type {import("axios").AxiosInstance}
         */
        const axios = app.axios;

        /**
         * @type {import("axios").AxiosRequestConfig}
         */
        const config = {
            method: 'GET',
            url: 'https://api.line.me/v2/profile',
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        };

        /**
         * @type {import("axios").AxiosResponse<import("../types/type.LineAPI").LineAPIResponseUserProfile>}
         */
        const response = await axios(config);

        return response.data;
    }
};


/**
 * @param state
 * @return {{ sessionId: string, redirect_uri: string | null, timeoutInstance: NodeJS.Timeout } | null}
 */
const getLineSessionState = (state = '') => {
    return get(lineSessionState, state, null);
};


module.exports = {
    lineAPICreateLogin,
    lineAPIGetAccessToken,
    lineAPIRevokeAccessToken,
    lineAPIGetUserProfile,
    getLineSessionState
};