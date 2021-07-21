const express = require('express'); // NodeJS Framework
const app = express(); // Init the EXPRESS App
const server = require('http').Server(app); // Init the HTTP Server with the EXPRESS App
const port = process.env.PORT || 8080; // Define the Port
const io = require('socket.io')(server); // Init the Socket.io Library
const { v4: uuidv4 } = require('uuid'); // Unique ID
const { ExpressPeerServer } = require('peer'); // Include PeerJS
const peerServer = ExpressPeerServer(server, { // Initialize the PeerJS Server
    debug: true
});

server.listen(port); // Port to Launch the Server ON
console.log('Listening on localhost:' + port);

app.set('view engine', 'ejs'); // Use EJS
app.use(express.static('public'));
app.use('/peerjs', peerServer); // Use PeerJS

app.get('/', (req, res) => { // Get the files for App e.i. '/'=root
    res.redirect(`/${uuidv4()}`); // Generate Unique ID (uuidv4)
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room }); // Get Room ID in URL
});

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);
        
        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message)
        });

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        });
    });
});