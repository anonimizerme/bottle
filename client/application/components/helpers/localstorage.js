const CLIENT_ID = 'cid';

export default {
    getClientId(defaultClientId = null) {
        const clientId = localStorage.getItem(CLIENT_ID);
        return clientId ? clientId : defaultClientId;
    },

    setClientId(clientId) {
        localStorage.setItem(CLIENT_ID, clientId);
    }
}