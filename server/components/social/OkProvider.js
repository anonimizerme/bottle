const crypto = require('crypto');

const _ = require('lodash');
const axios = require('axios');

const config = require('../../config');

class OkProvider {
    constructor(socialId) {
        this.socialId = socialId;

        this._initAxios();
    }

    _initAxios() {
        this.axios = axios.create({
            baseURL: 'https://api.ok.ru'
        })
    }

    async _apiRequest(method, params) {
        let paramsWithSig = [];

        params.application_key = config.social.ok.applicationKey;
        params.format = 'json';
        params.method = method;

        _.each(
            params,
            (val, key) => {
                paramsWithSig.push(`${key}=${val}`);
            }
        );

        paramsWithSig.sort();
        paramsWithSig.push(config.social.ok.secretKey);

        params.sig = crypto.createHash('md5').update(paramsWithSig.join('')).digest('hex');

        try {
            const result = await this.axios.get('fb.do', { params });

            if (_.has(result, 'data.error_code')) {
                throw new Error(JSON.stringify(result.data));
            }

            return result.data;
        } catch (e) {
            throw e;
        }
    }

    get providerName() {
        return 'ok';
    }

    async getProfile() {
        const data = await this._apiRequest('users.getInfo', {
            fields: 'first_name,last_name,pic1024x768',
            uids: this.socialId,
        });

        return {
            firstName: data[0].first_name,
            lastName: data[0].last_name,
            picture: data[0].pic1024x768
        };
    }
}

module.exports = OkProvider;