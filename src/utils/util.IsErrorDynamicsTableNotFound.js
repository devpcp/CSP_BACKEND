/**
 * A utility help you to detect is error from that "Dynamics Table" is not defined
 * @param {string | Error} inputError
 * @returns {boolean}
 */
const utilIsErrorDynamicsTableNotFound = (inputError = "") => {
    const regexDatabaseNotFound = /((SequelizeDatabaseError){1}\:\s{1}(relation){1}\s{1}\"{1}.*\"{1}\s{1}(does){1}\s{1}(not){1}\s{1}(exist){1}){1}/g;

    if (regexDatabaseNotFound.test(new Error(inputError).message)) {
        return true;
    } else {
        return false;
    }
};

module.exports = utilIsErrorDynamicsTableNotFound;