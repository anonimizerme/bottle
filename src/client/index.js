import Application from './components/Application';
import Members from './components/Members';
import Bottle from './components/Bottle';

let app = new Application();
app.attachToDocument();

let members = new Members(app);
members.init(setup);

let bottle = new Bottle(app);
bottle.init();

function setup() {
    let targetAngle = 360*3 + [0, 90, 180, 270][Math.floor(Math.random() * 4)];
    let maxSpeed = 0;
    let speed = 0;
    let distancetoStop = Math.max(180+Math.random()*90);
    app.pixi.ticker.add(delta => {
        // increasing speed
        if (bottle.object.angle <= 180) {
            speed += 0.15;
        } else if (bottle.object.angle >= targetAngle) {
            speed = 0;
            bottle.object.angle = targetAngle;
            return;
        } else if (targetAngle - bottle.object.angle < distancetoStop) {
            maxSpeed = Math.max(maxSpeed, speed);

            const percent = (bottle.object.angle - (targetAngle - distancetoStop)) / (distancetoStop / 100);
            let percentInvert = 100 - percent;
            speed = (maxSpeed / 100) * Math.max(percentInvert, 8);
        }

        bottle.object.angle += delta * speed;
    });
}
