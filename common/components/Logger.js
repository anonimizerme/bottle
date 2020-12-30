const _ = require('lodash');

let loggers = {};

class Logger {
    constructor(name) {
        this._name = name;
    }

    log(message) {
        console.log(`${this._name}:\t${message}`);
    }

    error(error) {
        console.error(`${this._name}: -- ERROR --\t${error.message}`);
    }
}

module.exports = (name) => {
    if (_.isUndefined(loggers[name])) {
        loggers[name] = new Logger(name);
    }

    return loggers[name];
};