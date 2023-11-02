const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const server = new WebSocket.Server({ port: 3000 });
const connectedUsers = new Map();
const connectedUsersNames = new Map();

server.on('connection', (socket) => {
    console.log('New client connected');

    let userId = uuidv4();
    connectedUsers.set(userId, socket);
    socket.send(JSON.stringify({ type: 'userId', id: userId }));

    let username = null;
    socket.on('message', (message) => {
        try {
            const messageData = JSON.parse(message);

            if (messageData.type === 'username') {
                username = messageData.username;
                connectedUsersNames.set(userId, username);
                sendUserListToAll();
            } else {
                console.log(`Received message: ${messageData.message}`);
                if (username) {
                    if (messageData.recipient === 'all') {
                        // Send to all clients
                        server.clients.forEach((client) => {
                            if (client !== socket && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify(messageData));
                            }
                        });
                    } else {
                        server.clients.forEach((client) => {
                            if (client.readyState === WebSocket.OPEN && client !== socket) {
                                if (connectedUsers.get(messageData.recipient) === client) {
                                    client.send(JSON.stringify(messageData));
                                }
                            }
                        });
                    }
                } else {
                    console.error('Message received without a valid username:', messageData.message);
                }
            }
        } catch (error) {
            console.error('Error processing the message:', error);
        }
    });

    socket.on('close', () => {
        console.log('Client disconnected');
        if (userId) {
            connectedUsers.delete(userId);
            connectedUsersNames.delete(userId);
        }
    });
});

function sendUserListToAll() {
    const userList = Array.from(connectedUsersNames);
    server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'userList', users: userList }));
        }
    });
}