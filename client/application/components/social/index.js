import OkProvider from './ok';

class SocialProvider {
    constructor() {
        this.provider = null;

        this._identifyProvider();
    }

    _identifyProvider() {
        const paramsString = location.search.slice(1);
        const searchParams = new URLSearchParams(paramsString);

        if (searchParams.has('api_server')) {
            this.provider = new OkProvider(searchParams);
        }
    }

    get hasProvider() {
        return this.provider !== null;
    }

    get providerName() {
        return this.provider.providerName;
    }

    getSocialId() {
        return this.provider.getSocialId();
    }
}

export default new SocialProvider();