var mongo = require('mongodb').MongoClient,
	client = require('socket.io').listen(8080).sockets;

mongo.connect('mongodb://127.0.0.1/chat', function(err, db) {
	if (err) throw err;

	client.on('connection', function(socket) {

		var col = db.collection('messages'),
			sendStatus = function (s) {
				socket.emit('status', s);
			};

		// Waiting for input
		socket.on('input', function(data) {
			var name = data.name,
				message = data.message,
				whitespacePattern = /^\s*$/;

			if(whitespacePattern.test(name) || whitespacePattern.test(message)) {
				sendStatus('Both name and message must be given.');
			}
			else {
				col.insert({name: name, message: message}, function() {
					sendStatus({
						message: "Message sent!",
						clear: true
					});
				});
			}			
		});
	});
});