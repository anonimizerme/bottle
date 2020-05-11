import _ from 'lodash';
import * as PIXI from 'pixi.js';
import {getPosition, memberImageSize} from './helpers/memberPositions';

class Member {
    constructor(container, image, isMe) {
        this._object = new PIXI.Container();

        const sprite = new PIXI.Sprite.from(image);
        sprite.name = 'sprite';
        sprite.anchor.set(0.5);
        sprite.width = memberImageSize.width;
        sprite.height = memberImageSize.height;

        this._object.addChild(sprite);

        if (isMe) {
            const text = new PIXI.Text('я', {fill: 0xFFFFFF, fontSize: 20});
            text.anchor.set(0.5);
            text.position.x = 0;
            text.position.y = 35;

            this._object.addChild(text);
        }

        const kisses = new PIXI.Text('❤️ = 0', {fill: 0xFFFFFF, fontSize: 20});
        kisses.name = 'kisses';
        kisses.anchor.set(0.5);
        kisses.position.x = 0;
        kisses.position.y = 50;

        this._object.addChild(kisses);

        container.addChild(this._object);
    }

    get object() {
        return this._object;
    }

    set kisses(kisses) {
        this._object.getChildByName('kisses').text = '❤️ = '+kisses;
    }

    reset() {
       this._object.getChildByName('sprite').tint = 0xFFFFFF;
    }

    setHost() {
        this._object.getChildByName('sprite').tint = 0x00FF2A;
    }

    setInCouple() {
        this._object.getChildByName('sprite').tint = 0xFF00D2;
    }
}

class Members {
    constructor(app) {
        this._app = app;
        this._container = null;

        /** List of members */
        this._list = [];

        /** List of kisses */
        this._kisses = {};

        /** List of Member objects */
        this._objects = {};

        this.makeContainer();
    }

    init() {
        this.render();
    }

    makeContainer() {
        this._container = new PIXI.Container();
        this._container.x = 0;
        this._container.y = 0;

        this._app.pixi.stage.addChild(this._container);
    }

    set list(members) {
        if (this._list !== members) {
            this._list = members;
            this.render();
        }
    }

    set kisses(kisses) {
        if (this._kisses !== kisses) {
            this._kisses = kisses;
            this.render();
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

    render() {
        // Remove deleted members
        // todo:

        // Adding new members
        for (let i=0; i<this._list.length; i++) {
            let item = this._list[i];

            if (!_.has(this._objects, item.id)) {
                const member = new Member(this._container, `assets/${i % 4}.svg`, item.id == this._app.store.getState().client.clientId);
                member.object.position = getPosition(this._app.pixi.screen, i);
                this._objects[item.id] = member;
            }
        }

        // set Kisses
        for (let i in this._kisses) {
            this._objects[i].kisses = this._kisses[i];
        }
    }
}

export default Members;