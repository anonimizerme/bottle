import _ from 'lodash';

import Element from './core/Element';
import Member from './Member';
import {getPosition} from '../helpers/memberPositions';

class MemberList extends Element {
    constructor(app) {
        super(app.pixi);

        this._app = app;

        /** List of members */
        this.list = [];

        /** List of kisses */
        this.kisses = {};

        /** List of Member objects */
        this.objects = {};
    }

    set list(members) {
        if (this._list !== members) {
            this._list = members;

            //todo: remove leaved members https://trello.com/c/nXTmtPfg

            for (let i=0; i<this._list.length; i++) {
                let item = this._list[i];

                if (!_.has(this._objects, item.id)) {
                    const member = new Member(this._app, {image: `assets/${i % 4}.svg`, isMe: item.id == this._app.store.getState().client.clientId});
                    member.container.position = getPosition(this._app.pixi.screen, i);
                    this.objects[item.id] = member;
                }
            }
        }
    }

    set kisses(kisses) {
        if (this._kisses !== kisses) {
            this._kisses = kisses;

            for (let i in this._kisses) {
                this.objects[i].kissesValue = this._kisses[i];
            }
        }
    }

    reset() {
        console.log('!!!, reset');
        _.forEach(this._objects, object => object.reset());
    }

    setHost(memberId) {
        this._objects[memberId].setHost();
    }

    setCouple(memberId) {
        this._objects[memberId].setInCouple();
    }
}

export default MemberList;