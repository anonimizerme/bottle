exports.up = function (knex) {
    return knex.schema.createTable('members', table => {
        table.uuid('id').primary();
        table.string('name').notNullable();
        table.string('picture').notNullable();
    })
};

exports.down = function (knex) {
    return knex.schema.dropTable('members');
};
