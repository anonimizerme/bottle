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
    },
    social: {
        ok: {
            accessToken: process.env.SOCIAL_OK_ACCESS_TOKEN,
            sessionKey: process.env.SOCIAL_OK_SESSION_KEY,
            applicationId: process.env.SOCIAL_OK_APPLICATION_ID,
            applicationKey: process.env.SOCIAL_OK_APPLICATION_KEY,
            secretKey: process.env.SOCIAL_OK_SECRET_KEY
        }
    }
}