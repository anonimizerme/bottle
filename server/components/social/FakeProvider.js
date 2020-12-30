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
            first_name: faker.name.firstName(),
            last_name: faker.name.lastName(),
        }
    }
}

module.exports = FakeProvider;