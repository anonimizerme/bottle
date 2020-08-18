const _ = require('lodash');
const uuid = require('uuid');

const BaseModel = require('./BaseModel');

const ROOM_LIMIT = 12;

class Room extends BaseModel {
    static get tableName() {
        return 'rooms';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            properties: {
                memberIds: {type: 'array', items: {type: 'string'}, maxItems: ROOM_LIMIT},
                hostMemberId: {type: ['string', 'null']},
                coupleMemberId: {type: ['string', 'null']},
                memberKisses: {type: 'object'}
            }
        };
    }

    static get jsonAttributes() {
        return ['memberIds', 'memberKisses'];
    }

    static get virtualAttributes() {
        return ['isSpun'];
    }

    /**
     * Create Room instance
     * @returns {Room}
     */
    static create() {
        return this.fromJson({
            id: uuid.v4(),
            memberIds: [],
            hostMemberId: null,
            coupleMemberId: null,
            memberKisses: {}
        })
    }

    /**
     * If coupleMemberId is set - bottle has been spun
     * @returns {boolean}
     */
    get isSpun() {
        return !_.isNull(this.coupleMemberId);
    }
}

module.exports = Room;

module.exports.ROOM_LIMIT = ROOM_LIMIT;