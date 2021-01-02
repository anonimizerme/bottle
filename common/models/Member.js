const uuid = require('uuid');

const BaseModel = require('./BaseModel');

class Member extends BaseModel {
    static get tableName() {
        return 'members';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['socialProvider', 'socialId', 'firstName', 'lastName', 'picture'],
            properties: {
                socialProvider: { type: 'string' },
                socialId: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                picture: { type: 'string' },
            }
        };
    }

    /**
     * Create Member instance
     * @param socialProvider
     * @param socialId
     * @param firstName
     * @param lastName
     * @param picture
     * @returns {Member}
     */
    static create(socialProvider, socialId, firstName, lastName, picture) {
        return this.fromJson({
            id: uuid.v4(),
            socialProvider,
            socialId,
            firstName,
            lastName,
            picture
        })
    }
}

module.exports = Member;