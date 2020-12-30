const _ = require('lodash');
const assert = require('assert');
const Member = require('../../common/models/Member');

class MembersManager {
    /**
     * todo: remove this method usage
     * @deprecated
     */
    hasMember(key) {
        throw new Error('This method is deprecated');
    }

    /**
     * Create new member
     * @param {Member} member
     * @returns {Objection.SingleQueryBuilder<Objection.QueryBuilder<this, this[]>>}
     */
    async addMember(member) {
        assert(member instanceof Member);
        return member.$query().insert();
    }

    /**
     * Get Member by Social Provider and Social Id
     * @param socialProvider
     * @param socialId
     * @returns {Objection.QueryBuilder<this, this>}
     * @throws {Member.NotFoundError}
     */
    async getMemberBySocial(socialProvider, socialId) {
        return Member.query().findOne({
            social_provider: socialProvider,
            social_id: socialId
        });
    }

    /**
     * Get Member by Id
     * @param id
     * @returns {Objection.QueryBuilder<this, this>}
     * @throws {Member.NotFoundError}
     */
    async getMember(id) {
        return Member.query().findById(id);
    }

    /**
     * Get Members by list of Id
     * @param {string[]} ids
     * @returns {Objection.QueryBuilder<this, this>}
     * @throws {Member.NotFoundError}
     */
    async getMembers(ids) {
        return Member.query().findByIds(ids);
    }

    /**
     * todo: remove this method usage
     * @deprecated
     */
    removeMember(key) {
        throw new Error('This method is deprecated');
    }
}

module.exports = MembersManager;