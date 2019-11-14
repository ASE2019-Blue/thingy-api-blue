require('dotenv').config();
const server = require('./server');
const io = require('socket.io')(server);

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`API server started on ${port}`));



//websocket config
console.log('websocket connected')
io.on('connection', function(socket){
    console.log('Socket connection', socket.id);

    socket.on('start', function(data){
        socket.join(data.matchId);
    });

    socket.on('stop', function(data){
        socket.leave(data.matchId);
    });

    socket.on('disconnect', function(){
        for (var i = socket.rooms.length - 1; i >= 0; i--) {
            socket.leave(socket.rooms[i]);
        }
    });
});

module.exports = io;
