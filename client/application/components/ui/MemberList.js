import _ from 'lodash';
import faker from 'faker';

import app from '../../index';
import Element from './core/Element';
import Member from './Member';
import {ROOM_LIMIT} from '../../../../common/models/Room';
import {getPosition} from '../helpers/memberPositions';

class MemberList extends Element {
    constructor(pixi) {
        super(pixi);

        /** List of members */
        this.list = [];

        /** List of kisses */
        this.kisses = {};

        /** List of Member objects */
        this.objects = {};

        // Other props
        this._initialKissesSet = true;
    }

    set list(members) {
        if (this._list !== members) {
            this._list = members;

            //todo: remove leaved members https://trello.com/c/nXTmtPfg

            for (let i=0; i<this._list.length; i++) {
                let m = this._list[i];

                if (!_.has(this.objects, m.id)) {
                    const member = new Member(this.pixi, {
                        image: m.picture,
                        firstName: m.firstName,
                        lastName: m.lastName
                    });
                    member.container.position = getPosition(this.screen, i, ROOM_LIMIT);
                    this.objects[member.id] = member;
                }
            }
        }
    }

    set kisses(kisses) {
        if (this._kisses !== kisses) {
            this._kisses = kisses;

            for (let i in this._kisses) {
                this.objects[i].kisses.update(this._kisses[i], !this._initialKissesSet);
            }
        }

        this._initialKissesSet = false;
    }

    reset() {
        console.log('!!!, reset');
        _.forEach(this.objects, object => object.reset());
    }

    setHost(memberId) {
        this.objects[memberId].setHost();
    }

    setCouple(memberId) {
        this.objects[memberId].setInCouple();
    }
}

export default MemberList;