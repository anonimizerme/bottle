class OkProvider {
    constructor(urlSearchParams) {
        this.urlSearchParams = urlSearchParams;
    }

    get providerName() {
        return 'ok';
    }

    get(param) {
        return this.urlSearchParams.get(param);
    }

    getSocialId() {
        return this.get('logged_user_id');
    }
}

export default OkProvider;