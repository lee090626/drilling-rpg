const { Graphics } = require('pixi.js');
const g = new Graphics();
g.fill({color: 0xff0000});
g.roundRect(0, 0, 10, 10, 2);
console.log(g.context.instructions);
