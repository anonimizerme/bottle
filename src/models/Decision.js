class Decision {
    constructor() {
        this._hostDecision = -1;
        this._memberDecision = -1;
    }

    get hostDecision() {
        return this._hostDecision !== -1 ? this._hostDecision : undefined;
    }

    get memberDecision() {
        return this._memberDecision !== -1 ? this._memberDecision : undefined;
    }

    set hostDecision(ok) {
        this._hostDecision = !!ok;
    }

    set memberDecision(ok) {
        this._memberDecision = !!ok;
    }

    get isReady() {
        return this._hostDecision !== -1 && this._memberDecision !== -1;
    }

    get isCouple() {
        return this.isReady ? this._hostDecision && this._memberDecision : false;
    }
}

module.exports = Decision;