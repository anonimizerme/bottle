const {Model} = require('objection');
const Knex = require('knex');

const knexfile = require('../knexfile');

const knex = Knex(knexfile.default);

module.exports.init = () => {
    Model.knex(knex);
}

module.exports.destroy = () => {
    knex.destroy();
}
