require('dotenv').config();
const server = require('./server');

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`API server started on ${port}`));

const wsPort = process.env.WEBSOCKET_PORT || 3001;
console.log(`Websocket started on ${wsPort}`);
