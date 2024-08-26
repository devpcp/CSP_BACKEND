/**
 * A function to generate "isuse" key object with value from "status" request, or other field where related
 * - "block" = issuse:0
 * - "active" = issuse:1
 * - "delete" = issuse:2
 * - default = empty object
 * @param status
 * @return {{isuse: number} | {}}
 */
const utilGetIsUse = (status = '') => {
    if (status === 'block') {
        return { isuse: 0 };
    } else if (status === 'active') {
        return { isuse: 1 };
    } else if (status === 'delete') {
        return { isuse: 2 };
    } else {
        return {};
    }
};

module.exports = utilGetIsUse;