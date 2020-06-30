exports.up = function (knex) {
    return knex.schema.createTable('rooms', table => {
        table.uuid('id').primary();
        table.jsonb('member_ids').notNullable();
        table.uuid('host_member_id').nullable();
        table.uuid('couple_member_id').nullable();
    })
};

exports.down = function (knex) {
    return knex.schema.dropTable('rooms');
};
