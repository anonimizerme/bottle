const {Model} = require('objection');
const Knex = require('knex');

const config = require('./config');

const knex = Knex(config.knex);

module.exports.init = () => {
    Model.knex(knex);
}

module.exports.destroy = () => {
    // knex.destroy();
}
