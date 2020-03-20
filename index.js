const http = require('http');
const fs = require('fs');
const server = require('./src/server');

server.init(http.createServer().listen(80));