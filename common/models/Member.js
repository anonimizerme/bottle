const uuid = require('uuid');

const BaseModel = require('./BaseModel');

class Member extends BaseModel {
    static get tableName() {
        return 'members';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['socialProvider', 'socialId', 'name', 'picture'],
            properties: {
                socialProvider: { type: 'string' },
                socialId: { type: 'string' },
                name: { type: 'string' },
                picture: { type: 'string' },
            }
        };
    }

    /**
     * Create Member instance
     * @param socialProvider
     * @param socialId
     * @param name
     * @param picture
     * @returns {Member}
     */
    static create(socialProvider, socialId, name, picture) {
        return this.fromJson({
            id: uuid.v4(),
            socialProvider, socialId, name, picture
        })
    }
}

module.exports = Member;