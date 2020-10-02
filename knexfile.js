module.exports = {

    default: {
        client: 'postgresql',
        connection: {
            database: 'bottle',
            user: 'postgres',
            password: 'bottle',
            acquireConnectionTimeout: 5000
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    }

};
