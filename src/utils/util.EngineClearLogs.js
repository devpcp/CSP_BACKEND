const { config_app_db_sys_log_clear_after_days } = require("../config");
const uuid = require("uuid");
const { isPlainObject, isFunction, isSafeInteger, get } = require("lodash");
const moment = require("moment");
const { handleSaveLog } = require("../handlers/log");
const utilConvertStringToNumberMilliseconds = require("./util.ConvertStringToNumberMilliseconds");
const db = require("../db");

const tasksClearLogsDB = {};

/**
 * It saves a log to the database
 * @param [systemAction] - The action that was performed.
 * @param [errors] - This is the error message that you want to log.
 */
const saveLogToDB = (systemAction = '', errors = '') => {
    handleSaveLog(
        {
            headers: {
                'user-agent': 'Postman',
                'HTTP_X_REAL_IP': '127.0.0.1'
            }
        },
        [systemAction, errors]
    ).catch(e => console.error(e));
};


/**
 * It generates a SQL command that deletes all log entries that are older than a specified number of days.
 * @param [maxLogDays=120] - The maximum number of days to keep logs.
 * @returns A sql command string
 */
const generateSQLCommandDelLogByDays = (maxLogDays = 120) => {
    if (!isSafeInteger(maxLogDays) || maxLogDays < 1) {
        throw Error('maxLogDays is required integer');
    }

    return `
        DELETE FROM systems.logs
        WHERE extract(day from now()::timestamp - logdate::timestamp) > ${maxLogDays}::double precision;

        DELETE FROM systems.sysm_session
        WHERE extract(day from now()::timestamp - expiration_time::timestamp) > ${maxLogDays}::double precision;
    `;
};

/**
 * "Given a previous run date and a maximum number of days to keep logs, return the next run date."
 *
 * The function is written in JavaScript, but the language is not important. The important thing is that the function is
 * written in a way that makes it easy to understand
 * @param [previousRunDate] - The date of the last time the job ran.
 * @param [maxLogDays=120] - The maximum number of days to keep logs for.
 * @returns A moment object
 */
const generateNextRunDate = async (previousRunDate = moment(), maxLogDays = 120) => {
    if (!moment.isMoment(previousRunDate)) {
        throw Error('previousRunDate is required moment');
    }

    if (!isSafeInteger(maxLogDays) || maxLogDays < 1) {
        throw Error('maxLogDays is required integer');
    }

    return moment(previousRunDate).add(maxLogDays, 'day').startOf('days').add(1, 'hour');
};


/**
 * It creates a task that will run every 60 seconds and delete all logs that are older than 120 days.
 * @param [taskId] - The task ID, if not specified, it will be generated automatically.
 * @param [everyDaysBy=120] - Schedule task check every at as day as your defined.
 * @param {function} [config.callbackLog=null] - A callback function to see log output.
 * @param {function} [config.callbackTask=null] - A callback function to see output when task is running finished.
 * @returns A function that returns a promise.
 */
const createTaskClearLogsDB = async (taskId = '', everyDaysBy = 120, config = {}) => {
    const currentDate = moment();

    const intervalTime = utilConvertStringToNumberMilliseconds("60s");

    if (!taskId) {
        taskId = uuid.v4()
    }

    if (everyDaysBy < 1) {
        throw Error(`This task will allowed to clear log at least 1 day (allow: maxLogDays >= 1)`);
    }

    if (isPlainObject(tasksClearLogsDB[taskId])) {
        throw Error(`This task id already exists.`)
    }

    const callbackLog = get(config, 'callbackLog', null);
    const callbackLogApply = (log = '') => isFunction(callbackLog) ? callbackLog(log) : null;
    const callbackTask = get(config, 'callbackTask', null);
    const callbackTaskApply = (data) => isFunction(callbackTask) ? callbackTask(data) : null;

    const taskRunFunction = async (getId = taskId) => {
        const nextRunDate = tasksClearLogsDB[getId].nextRunDate;

        if (!nextRunDate) {
            return 'no nextRunDate, skipped';
        }

        callbackLogApply(`moment().unix() ${moment().unix()} < nextRunDate ${nextRunDate}: ${moment().unix() < nextRunDate}`)

        if (moment().unix() < nextRunDate) {
            callbackLogApply(`is not task time, skipped`);
            return `is not task time, skipped`;
        }

        // ### Start - Apply Command ###
        if (tasksClearLogsDB[getId].sqlCommand) {
            await db.query(tasksClearLogsDB[getId].sqlCommand)
                .then(() => saveLogToDB('taskSchedule ClearLogsDB', `query with: ${tasksClearLogsDB[getId].sqlCommand}`))
                .catch(errors => saveLogToDB('taskSchedule ClearLogsDB', errors));

        }
        // ### End - Apply Command ###

        callbackTaskApply(tasksClearLogsDB[getId]);

        return 'committed';
    };

    tasksClearLogsDB[taskId] = {
        taskId: taskId,
        sqlCommand: generateSQLCommandDelLogByDays(config_app_db_sys_log_clear_after_days),
        createdDate: moment().unix(),
        lastedRunDate: null,
        nextRunDate: await generateNextRunDate(currentDate, everyDaysBy).then(r => r.unix()),
        isRunning: false,
        intervalObject: setInterval(async () => {
            if (isFunction(callbackLog)) {
                callbackLog('task is running, at ' + moment().unix());
            }

            if (!isPlainObject(tasksClearLogsDB[taskId])) {
                if (isFunction(callbackLog)) {
                    callbackLog('task is not created, skipped');
                }

                return 'task is not created, skipped';
            }

            if (tasksClearLogsDB[taskId].isRunning === true) {
                if (isFunction(callbackLog)) {
                    callbackLog('task is running, skipped');
                }

                return 'task is running, skipped';
            }

            tasksClearLogsDB[taskId].isRunning = true;

            await taskRunFunction(taskId)
                .then(async (r) => {
                    if (r === 'committed') {
                        tasksClearLogsDB[taskId].lastedRunDate = moment().unix();
                        tasksClearLogsDB[taskId].nextRunDate = await generateNextRunDate(moment.unix(tasksClearLogsDB[taskId].lastedRunDate), everyDaysBy).then(r => r.unix());
                    }
                })
                .catch(e => callbackLogApply(e));

            tasksClearLogsDB[taskId].isRunning = false;

            return 'done';

        }, intervalTime),
    };

    return tasksClearLogsDB[taskId];
};

/**
 * It deletes a task from the `tasksClearLogsDB` object
 * @param [id] - The id of the task.
 * @returns {Promise<string|null>} The id of the task that was deleted.
 */
const deleteTaskClearLogsDB = async (id = '', options = {}) => {
    if (!isPlainObject(tasksClearLogsDB[id])) {
        return null;
    }
    else {
        const retry = isSafeInteger(get(options, 'retry', 5)) ? get(options, 'retry', 5) : 5;

        if (retry <= 0) {
            throw Error(`Cannot delete, due out of retry`);
        }

        if (tasksClearLogsDB[id].isRunning === true) {
            return await new Promise((resolve, reject) => {
                setTimeout(() => {
                    createTaskClearLogsDB(id, { retry: retry - 1 })
                        .then(r => resolve(r))
                        .catch(e => reject(e));
                }, 5000)
            });
        }

        tasksClearLogsDB[id].isRunning = true;
        clearInterval(tasksClearLogsDB[id].intervalObject);
        delete tasksClearLogsDB[id];

        return id;
    }
};

module.exports  = {
    createTaskClearLogsDB,
    deleteTaskClearLogsDB
}