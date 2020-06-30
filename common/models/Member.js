const BaseModel = require('./BaseModel');

class Member extends BaseModel {
    static get tableName() {
        return 'members';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name', 'picture'],
            properties: {
                name: { type: 'string' },
                picture: { type: 'string' }
            }
        };
    }

    /**
     * Create Member instance
     * @param id
     * @param name
     * @param picture
     * @returns {Member}
     */
    static create(id, name, picture) {
        return this.fromJson({id, name, picture})
    }
}

module.exports = Member;