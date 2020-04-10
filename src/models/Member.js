class Member {
    constructor(id = null, name = null, picture = null) {
        this._id = id;
        this._name = name;
        this._picture = picture;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get picture() {
        return this._picture;
    }

    set id(id) {
        this._id = id;
    }

    set name(name) {
        this._name = name;
    }

    set picture(picture) {
        this._picture = picture;
    }

    get json() {
        return {
            id: this.id,
            name: this.name,
            picture: this.picture
        }
    }
}

module.exports = Member;