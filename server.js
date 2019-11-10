var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

//comment
users = [];
connections = [];

server.listen(process.env.PORT || 3000);
console.log('server is running ...');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	connections.push(socket);
	console.log('Connected: %s sockets connected', connections.length);

	//Disconnect
	socket.on('disconnect', function(data){
		if(!socket.username) return;

		users.splice(users.indexOf(socket.username), 1);
		updateUsernames();
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected: %s sockets connected, data: %s', connections.length, data);
	});

	//Send message
	socket.on('send message', function(data){
		//console.log(data);
		io.sockets.emit('new message', 
			{
				user: socket.username, 
				msg: data.msg, 
				from: data.from, 
				to: data.to,
				time: new Date()
			});
	});

	//New User
	socket.on('new user', function(data, callback){
		callback(true);
		socket.username = data;
		users.push(socket.username);
		updateUsernames();
	});

	function updateUsernames(){
		io.sockets.emit('get users', users);
	}
	
});