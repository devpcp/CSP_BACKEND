/**
 * Engine Auth session to handle [{UserModel.login_status}] at Database
 */
class engineAuthSession {
    /**
     * Session's pool
     * @type {{userId: string, sessionObjectTimeoutNumber: number | null}[]}
     */
    $_AUTH_SESSIONS = [];

    /**
     * A task schedule where set one of session from session's pool to session timeout (millisecond)
     * @type {number}
     */
    $_SessionTimeoutMillisecond = 8000;

    /**
     * A task schedule where clear session's pool where is session timeout (millisecond)
     * @type {number}
     */
    $_TaskCheckIntervalMillisecond = 5000;


    /**
     * Sequelize UserModel
     */
    #$_UserModel = require('../models/Users/User');

    /**
     * A log callback function
     */
    $_CallbackLog = function (...outputLog) {
        console.log(new Date(), ...outputLog);
    };

    /**
     * Create and set settings this engineAuthSession
     * @param sessionTimeoutMillisecond {number?} - A task schedule where set one of session from session's pool to session timeout (millisecond)
     * @param taskCheckIntervalMillisecond {number?} - A task schedule where clear session's pool where is session timeout (millisecond)
     * @param callbackLog {function?} - A log callback function can be make by user-defined (default: console.log)
     */
    constructor(sessionTimeoutMillisecond, taskCheckIntervalMillisecond, callbackLog) {
        if (Number.isSafeInteger(taskCheckIntervalMillisecond) && taskCheckIntervalMillisecond > 0) {
            this.$_TaskCheckIntervalMillisecond = taskCheckIntervalMillisecond;
        }

        if (Number.isSafeInteger(sessionTimeoutMillisecond) && sessionTimeoutMillisecond > 0) {
            this.$_SessionTimeoutMillisecond = sessionTimeoutMillisecond;
        }

        if (typeof callbackLog == 'function') {
            this.$_CallbackLog = callbackLog
        }

        this.$_CallbackLog(
            'New auth session timeout engine are created and followed with these setting:',
            {
                taskCheckIntervalMillisecond: this.$_TaskCheckIntervalMillisecond,
                sessionTimeoutMillisecond: this.$_SessionTimeoutMillisecond,
                callbackLog: typeof callbackLog == 'function' ? 'user-defined' : 'default'
            }
        );

        this.doUpdateUser_Status_SignOutAll().catch(e => this.$_CallbackLog(e));

        this.#taskClearTrashSession();
    }

    /**
     * Add session to session's pool
     * @param userId
     */
    setSession(userId) {
        const findAuthSessionIndex = this.$_AUTH_SESSIONS.findIndex(where => where.userId === userId);
        if (findAuthSessionIndex === -1) {
            this.$_CallbackLog(`userId ${userId} is signIn`);
            this.#doAddSessionTimeout(userId);
        } else {
            this.$_CallbackLog(`userId ${userId} is exists signIn`);
            if (this.$_AUTH_SESSIONS[findAuthSessionIndex].sessionObjectTimeoutNumber !== null) {
                this.$_CallbackLog(`userId ${userId} is exists timeoutObject`);
                this.#doClearTimeout(userId);
                this.#doAddSessionTimeout(userId);
            } else {
                this.$_CallbackLog(`userId ${userId} is NOT exists timeoutObject`);
                this.$_AUTH_SESSIONS[findAuthSessionIndex].sessionObjectTimeoutNumber = this.#doSetTimeOut(userId);
            }
        }
    }

    /**
     * A function set task schedule to clear unused session in session's pool
     */
    #taskClearTrashSession() {
        const vm = this;
        setInterval(function () {
            vm.$_CallbackLog('Clear trash sessions');
            vm.$_AUTH_SESSIONS.filter(where => where.sessionObjectTimeoutNumber === null).forEach(
                where => {
                    vm.#doUpdateUser_Status(where.userId);
                }
            );
            vm.$_AUTH_SESSIONS = vm.$_AUTH_SESSIONS.filter(where => where.sessionObjectTimeoutNumber !== null);
            vm.$_CallbackLog('Session Left:', vm.$_AUTH_SESSIONS.length)
        }, this.$_TaskCheckIntervalMillisecond);

    }

    /**
     * Create [setTimeout] and returns to Timeout's block number (this block number is important to continues to run [clearTimeout])
     * @param userId
     * @returns {number}
     */
    #doSetTimeOut(userId) {
        const vm = this;
        return setTimeout(function () {
            vm.$_CallbackLog(`userId ${userId} is timeout`);
            vm.#doClearTimeout(userId);
        }, vm.$_SessionTimeoutMillisecond);
    }

    /**
     * Add [{userId, setTimeout}] to session's pool, if {userId} are exists in this pool the pool will reset [setTimeout]
     * @param userId {string}
     */
    #doAddSessionTimeout(userId) {
        const findAuthSessionIndex = this.$_AUTH_SESSIONS.findIndex(where => where.userId === userId);
        if (findAuthSessionIndex === -1) {
            this.$_AUTH_SESSIONS.push({
                userId: userId,
                sessionObjectTimeoutNumber: this.#doSetTimeOut(userId)
            });
        } else {
            this.$_CallbackLog(`Update Timeout Id: ${userId}`)
            this.$_AUTH_SESSIONS[findAuthSessionIndex].sessionObjectTimeoutNumber = this.#doSetTimeOut(userId);
        }
    }

    /**
     * Remove [setTimeout] method from session as requested
     * @param userId {string}
     */
    #doClearTimeout(userId) {
        const findAuthSessionIndex = this.$_AUTH_SESSIONS.findIndex(where => where.userId === userId);
        if (findAuthSessionIndex >= 0) {
            clearTimeout(this.$_AUTH_SESSIONS[findAuthSessionIndex].sessionObjectTimeoutNumber);
            this.$_AUTH_SESSIONS[findAuthSessionIndex].sessionObjectTimeoutNumber = null;
        }
    }

    /**
     * Update [{UserModel.login_status = 0}] at Database
     * @param userId {string}
     */
    #doUpdateUser_Status(userId) {
        const vm = this;
        if (userId) {
            this.#$_UserModel.update({login_status: 0}, {
                where: {id: userId}
            }).catch(e => vm.$_CallbackLog(e));
        }
    }

    /**
     * Update ALL [{UserModel.login_status = 0}] at Database and clear Session's pool
     * @returns {Promise<[number, User[]]>}
     */
    async doUpdateUser_Status_SignOutAll() {
        this.$_CallbackLog(`Clear all session`);
        this.$_AUTH_SESSIONS.forEach(where => this.#doClearTimeout(where.userId));
        return await this.#$_UserModel.update({login_status: 0}, {where: {}});
    }
}

module.exports = engineAuthSession;