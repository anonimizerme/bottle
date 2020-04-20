import store from './store';
import Application from './components/Application';

let app = new Application(store);
app.attachToDocument();
app.render();

setInterval(() => {
    store.dispatch({
        type: 'member_add',
        text: '123'
    })
}, 3000)