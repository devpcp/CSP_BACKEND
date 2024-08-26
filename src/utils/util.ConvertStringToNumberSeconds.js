/**
 * An enumerable modifier, see object "modifier" below
 * - "s" = Seconds
 * - "m" = Minutes
 * - "h" = Hours
 * - "d" = Days
 * @type {{multiplexer: number, modifier: string}[]}
 */
const enumModifier = [
    {
        modifier: 's',
        multiplexer: 1,
    },
    {
        modifier: 'm',
        multiplexer: 60,
    },
    {
        modifier: 'h',
        multiplexer: (60 * 60),
    },
    {
        modifier: 'd',
        multiplexer: (60 * 60) * 24,
    }
];

/**
 * A utility help convert string contains number and property of times To number of "seconds"
 * - example: inputString = "20m"
 * - example: inputString = "350h"
 * @param inputString
 * @return {number}
 */
const utilConvertStringToNumberSeconds = (inputString = "") => {
    if (!inputString) {
        return 0;
    }
    else {
        /**
         * Regex filter incoming parameter by "number" and "modifier"
         * - example: "20m"
         * - example: "350h"
         */
        const regexMatchFormat = /^([0-9]+)(d|D|m|M|y|Y|h|H|m|M|s|S){1}$/g;
        /**
         * Regex filter incoming parameter by "number" in selection 1 only
         */
        const regexSelect1 = /^[0-9]+$/g;
        /**
         * Regex filter incoming parameter by "modifier" in selection 2 only
         */
        const regexSelect2 = /^(d|D|m|M|y|Y|h|H|m|M|s|S){1}$/g;

        if (!regexMatchFormat.test(inputString)) { throw Error("Parameter @inputString wrong format"); }
        else {
            const splitData = inputString.split(regexMatchFormat).filter(where => where !== "");
            if (splitData.length !== 2) { throw Error("Parameter @inputString wrong format, due failed to split data"); }
            else {
                const valueData = splitData[0];
                if (valueData.replace(regexSelect1, "").length !== 0) { throw Error("Parameter @inputString wrong format, due wrong format in selection 1"); }
                else if (!Number.isSafeInteger(Number(valueData))) { throw Error("Parameter @inputString wrong format, due wrong format in selection 1"); }
                else {
                    const modifierData = splitData[1];
                    if (modifierData.replace(regexSelect2, "").length !== 0) { throw Error("Parameter @inputString wrong format, due wording format in selection 2"); }
                    else {
                        const getContentModifier = enumModifier.filter(where => where.modifier === modifierData.toLowerCase());
                        if (getContentModifier.length !== 1) { throw Error("Parameter @inputString wrong format, due no modifier matched in selection 2"); }
                        else {
                            return (+valueData) * getContentModifier[0].multiplexer;
                        }
                    }
                }
            }
        }
    }
};

module.exports = utilConvertStringToNumberSeconds;