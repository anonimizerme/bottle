const {init: initKnex} = require('./knex');
const server = require('./server');

process.on('uncaughtException', (error) => {
    console.log(error)
    console.trace();
});

initKnex();

server.init();