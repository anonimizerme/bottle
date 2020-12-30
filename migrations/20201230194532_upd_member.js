exports.up = function(knex) {
    return knex.schema.table('members', table => {
        table.string('social_provider').notNullable();
        table.string('social_id').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.table('members', table => {
        table.dropColumns(['social_provider', 'social_id']);
    })
};
