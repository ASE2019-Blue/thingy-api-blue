require('dotenv').config();
const server = require('./server');
const io = require('socket.io')(server);

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`API server started on ${port}`));


// websocket config
console.log('websocket connected');
io.on('connection', (socket) => {
    console.log('Socket connection', socket.id);

    socket.on('start', (data) => {
        socket.join(data.matchId);
    });

    socket.on('stop', (data) => {
        socket.leave(data.matchId);
    });

    socket.on('disconnect', () => {
        for (let i = socket.rooms.length - 1; i >= 0; i--) {
            socket.leave(socket.rooms[i]);
        }
    });
});

module.exports = io;
