import localstorage from './components/helpers/localstorage';
import getStore from './store';
import StateMachine from './components/StateMachine';
import Application from './components/Application';

import '../sass/main.sass';

const clientId = localstorage.getClientId();
const store = getStore(clientId);
const stateMachine = new StateMachine((state) => console.log(`stateMachine: ${JSON.stringify(state.value)}`));
let app = new Application(store, stateMachine);

app.init().then(() => {
    app.attachToDocument();
    window.app = app;
    app.render();
});

export default app;
//
// setInterval(() => {
//     store.dispatch({
//         type: 'member_add',
//         text: '123'
//     })
// }, 3000);