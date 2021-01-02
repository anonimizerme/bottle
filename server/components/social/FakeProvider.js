const faker = require('faker');

class FakeProvider {
    constructor(socialId) {
        this.socialId = socialId;
    }

    get providerName() {
        return 'fake';
    }

    async getProfile() {
        return {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            picture: 'fake.png'
        }
    }
}

module.exports = FakeProvider;