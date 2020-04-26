import localstorage from './components/helpers/localstorage';
import getStore from './store';
import StateMachine from './components/StateMachine';
import Application from './components/Application';

const clientId = localstorage.getClientId();
const store = getStore(clientId);
const stateMachine = new StateMachine((state) => console.log(`stateMachine: ${state.value}`));
let app = new Application(store, stateMachine);

app.attachToDocument();
app.render();
//
// setInterval(() => {
//     store.dispatch({
//         type: 'member_add',
//         text: '123'
//     })
// }, 3000);