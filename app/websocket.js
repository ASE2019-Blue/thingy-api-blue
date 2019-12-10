const WebSocket = require('ws');
const Jwt = require('jsonwebtoken');

const wsOptions = {
    port: process.env.WEBSOCKET_PORT || 3001,
    verifyClient({ req }, cb) {
        // for development only
        // req.user = { username: 'test' };
        // cb(true);
        // comment the two lines above and uncomment the following to use the token
        const { token } = req.headers;
        if (!token) cb(false, 401, 'Unauthorized');
        else {
            Jwt.verify(token, process.env.SECRET, (err, decoded) => {
                if (err) {
                    cb(false, 401, 'Unauthorized');
                } else {
                    req.user = decoded;
                    cb(true);
                }
            });
        }
    },
    clientTracking: true,
};
const wss = new WebSocket.Server(wsOptions);

wss.on('connection', (ws, req) => {
    const { username } = req.user;
    ws._id = username;
});


/**
 * Add the owner of a match to the match.
 *
 * @param username
 * @param code
 */
function addOwnerToMatch(username, code) {
    try {
        wss.clients.forEach((client) => {
            if (client._id === username) {
                client.matchCode = code;
            }
        });
    } catch (err) {
        console.log(err);
    }
}

/**
 * Add a client to a match (tap game).
 *
 * @param username
 * @param code
 * @param color
 */
function addPlayerToTGMatch(username, code, color) {
    try {
        const joinMsg = { msg: 'join', player: username, color };
        wss.clients.forEach((client) => {
            if (client._id === username) {
                client.matchCode = code;
            }
            if (client.matchCode === code) {
                client.send(JSON.stringify(joinMsg));
            }
        });
    } catch (err) {
        console.log(err);
    }
}

/**
 * Add a client to a match (Hide and seek).
 *
 * @param username
 * @param code
 */
function addPlayerToHASMatch(username, code) {
    try {
        const joinMsg = { msg: 'join', player: username };
        wss.clients.forEach((client) => {
            if (client._id === username) {
                client.matchCode = code;
            }
            if (client.matchCode === code) {
                client.send(JSON.stringify(joinMsg));
            }
        });
    } catch (err) {
        console.log(err);
    }
}

/**
 * Broadcast a start match message to every client in that match.
 *
 * @param code
 */
function startBroadcast(code) {
    try {
        const startMsg = { msg: 'start' };
        wss.clients.forEach((client) => {
            if (client.matchCode === code) {
                client.send(JSON.stringify(startMsg));
            }
        });
    } catch (err) {
        console.log(err);
    }
}

/**
 * Broadcast a stop match message to every client in that match.
 * Remove the client from the match.
 * @param code
 */
function stopBroadcast(code) {
    try {
        const stopMsg = { msg: 'stop' };
        wss.clients.forEach((client) => {
            if (client.matchCode === code) {
                client.send(JSON.stringify(stopMsg));
                client.matchCode = 0;
            }
        });
    } catch (err) {
        console.log(err);
    }
}

/**
 * Broadcast a cancelled match message to every client in that match.
 * Remove the client from the match.
 * @param code
 */
function cancelBroadcast(code) {
    try {
        const cancelMsg = { msg: 'cancel' };
        wss.clients.forEach((client) => {
            if (client.matchCode === code) {
                client.send(JSON.stringify(cancelMsg));
                client.matchCode = 0;
            }
        });
    } catch (err) {
        console.log(err);
    }
}


/**
 * Remove a client from a match.
 *
 * @param username
 * @param code
 */
function removePlayerFromMatch(username, code) {
    try {
        const quitMsg = { msg: 'quit', player: username };
        wss.clients.forEach((client) => {
            if (client._id === username) {
                client.matchCode = 0;
            }
            if (client.matchCode === code) {
                client.send(JSON.stringify(quitMsg));
            }
        });
    } catch (err) {
        console.log(err);
    }
}

/**
 * Notify the points of a player to all clients in that match during tap game.
 *
 * @param playerName
 * @param points
 * @param code
 */
function tapGamePointsNotification(playerName, points, code) {
    try {
        const msg = { msg: 'points', player: playerName, points };
        wss.clients.forEach((user) => {
            if (user.matchCode === code) {
                user.send(JSON.stringify(msg));
            }
        });
    } catch (err) {
        console.log(err);
    }
}

function hideAndSeekStartTimer(code, duration) {
    try {
        const msg = { msg: 'startTimer', duration };
        wss.clients.forEach((user) => {
            if (user.matchCode === code) {
                user.send(JSON.stringify(msg));
            }
        });
    } catch (err) {
        console.log(err);
    }
}

function hideAndSeekRequestLocation(code, requestId) {
    try {
        const msg = { msg: 'requestLocation', requestId };
        wss.clients.forEach((user) => {
            if (user.matchCode === code) {
                user.send(JSON.stringify(msg));
            }
        });
    } catch (err) {
        console.log(err);
    }
}

function hideAndSeekUpdateLocation(code, latitude, longitude) {
    try {
        const msg = { msg: 'location', latitude, longitude };
        wss.clients.forEach((user) => {
            if (user.matchCode === code) {
                user.send(JSON.stringify(msg));
            }
        });
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    addOwnerToMatch,
    addPlayerToTGMatch,
    addPlayerToHASMatch,
    startBroadcast,
    stopBroadcast,
    cancelBroadcast,
    removePlayerFromMatch,
    tapGamePointsNotification,
    hideAndSeekStartTimer,
    hideAndSeekRequestLocation,
    hideAndSeekUpdateLocation,
};
