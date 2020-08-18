exports.up = function (knex) {
    return knex.schema.table('rooms', table => {
        table.jsonb('member_kisses').nullable();
    })
};

exports.down = function (knex) {
    return knex.schema.table('rooms', table => {
        table.dropColumn('member_kisses');
    })
};
