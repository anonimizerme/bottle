const server = require('./src/server');

process.on('uncaughtException', (error) => {
    console.log(error)
    console.trace();
})

server.init();