module.exports = {
    port: process.env.SERVER_PORT,
    knex: {
        client: 'postgresql',
        connection: {
            host: process.env.POSTGRES_HOST,
            database: process.env.POSTGRES_DB,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD
        }
    }
}