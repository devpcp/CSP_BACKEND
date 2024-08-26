
const bcrypt = require('bcrypt')
const { Op } = require("sequelize");



const calSkip = (page, size) => {
    return (page - 1) * size;
};

/**
 * @param {number} count
 * @param {number} size
 * @return {number}
 */
const calPage = (count, size) => {
    return Math.ceil(count / size);
};


const generateHashPassword = (password) => {
    const salt = bcrypt.genSaltSync(10)
    const hashPassword = bcrypt.hashSync(password, salt)

    return hashPassword
}

/**
 * @template T
 * @param {T[]} array
 * @param {number} page_size
 * @param {number} page_number
 * @return {{pages: number, data: T[], currentCount: number, currentPage: number, totalCount: number}}
 */
const paginate = (array, page_size, page_number) => {

    const data = array.slice((page_number - 1) * page_size, page_number * page_size)

    return ({
        currentPage: page_number,
        pages: calPage(array.length, page_size),
        currentCount: data.length,
        totalCount: array.length,
        data: data
    });
}


const isNull = (data) => {
    if (data == null || data === '' || data === 'undefined' || data === 'null') {
        return true;
    } else {
        return false;
    }
}

function isUUID(uuid) {
    let s = "" + uuid;

    s = s.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
    if (s === null) {
        return false;
    }
    return true;
}


const similar = (a, b) => {
    var equivalency = 0;
    var minLength = (a.length > b.length) ? b.length : a.length;
    var maxLength = (a.length < b.length) ? b.length : a.length;
    for (var i = 0; i < minLength; i++) {
        if (a[i] == b[i]) {
            equivalency++;
        }
    }

    var weight = equivalency / maxLength;

    if (weight < 0.5) {
        var equivalency = 0;
        for (var i = 0; i < minLength; i++) {
            if (a[a.length - i] == b[b.length - i]) {
                equivalency++;
            }
        }
        weight = equivalency / maxLength;
    }


    return (weight * 100);
}

/**
 * A utility to helps you make Search JSON from JSON's key
 * @template T
 * @param {T[]} Keys - Language or Other Keys, example: Lang=["en", "th"]
 * @param {import("sequelize").Op.like | import("sequelize").Op.iLike | import("sequelize").Op.eq} Op
 * @param {string} Search - The search that you can include wind cards, example: Search="%dataToFind%"
 * @return {{[key: string]: { [key: Op.like | Op.iLike | Op.eq]: string }}[]}
 */
const generateSearchOpFromKeys = (Keys, Op, Search) => {
    const currentLang = Keys || ["en", "th"];
    return currentLang.map(
        where => {
            const key = where;
            const obj = {};
            obj[key] = { [Op]: Search };
            return obj;
        }
    );
};


module.exports = {
    generateHashPassword,
    paginate,
    isNull,
    isUUID,
    similar,
    generateSearchOpFromKeys,
}