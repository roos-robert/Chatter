(function () {
	var getNode = function(s) {
		return document.querySelector(s);
	},

	// Retrieving nodes for elements to work with
	status = getNode('.chat-status span'),
	messages = getNode('.chat-messages'),
	textarea = getNode('.chat textarea'),
	chatName = getNode('.chat-name'),

	// Sets default status, given in html-file
	statusDefault = status.textContent,

	setStatus = function(s) {
		status.textContent = s;

		// Returns status back to idle after 3 sec
		if(s !== statusDefault) {
			var delay = setTimeout(function () {
				setStatus(statusDefault);
				clearInterval(delay);
			}, 3000);
		}
	};

	// Connection to socket.io
	try {
		var socket = io.connect('http://192.168.2.121:8080');
	} catch(e) {
		console.log('Error when trying to connect to socket.io')
	}

	if (socket !== undefined) {
		// LIstening for output
		socket.on('output', function(data) {
			if(data.length) {
				// Looping through messages
				for(var x = 0; x < data.length; x++) {
					var message = document.createElement('div');
					message.setAttribute('class', 'chat-message');
					message.textContent = data[x].name + ': ' + data[x].message;

					messages.appendChild(message);
					messages.insertBefore(message, messages.firstChild);
				}
			}
		});

		// Listening for a status
		socket.on('status', function(data) {
			setStatus((typeof data === 'object') ? data.message : data);

			if(data.clear === true) {
				textarea.value = '';
			}
		});

		// Listening for keydown
		textarea.addEventListener('keydown', function(event) {
			var self = this;
				name = chatName.value;

			// If the shift-key is NOT down, message should be sent
			if(event.which === 13 && event.shiftKey === false) {
				socket.emit('input', {
					name: name,
					message: self.value
				});

				event.preventDefault();
			}
		});
	}
})();