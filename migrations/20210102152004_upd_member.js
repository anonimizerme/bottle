exports.up = function(knex) {
    return knex.schema.table('members', table => {
        table.dropColumns(['name']);
        table.string('first_name').nullable();
        table.string('last_name').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.table('members', table => {
        table.dropColumns(['first_name', 'last_name']);
    })
};
