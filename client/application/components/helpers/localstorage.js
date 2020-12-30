import {v4 as uuidv4} from 'uuid';

const CLIENT_ID = 'cid';

export default {
    getClientId() {
        let clientId = localStorage.getItem(CLIENT_ID);

        if (clientId === null) {
            clientId = uuidv4();
            localStorage.setItem(CLIENT_ID, clientId);
        }

        return clientId;
    },

    setClientId(clientId) {
        localStorage.setItem(CLIENT_ID, clientId);
    }
}