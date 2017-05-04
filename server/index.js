'use strict'

var Hapi = require('hapi'),
	Joi = require('joi'),
	Config = require('config'),
	Fs = require('fs');

// Create a server with validation
var server = new Hapi.Server({
	app: {
		validation: {
			allowUnknown: true
		}
	}
});

// Set the port and CORS to true
server.connection({
	port: Config.server.port,
	routes: {
		cors: true
	},
	tls: {
		key: Fs.readFileSync("certs/fakeName.key"),
		cert: Fs.readFileSync("certs/public.pem")
	}
});

// Log (to console & file) configuration
const options = {
	ops: {
		interval: 1000
	},
	reporters: {
		console: [{
			module: 'good-squeeze',
			name: 'Squeeze',
			args: [{
				log: '*',
				response: '*'
			}]
		}, {
			module: 'good-console'
		}, 'stdout'],
		file: [{
			module: 'good-squeeze',
			name: 'Squeeze',
			args: [{
				log: '*',
				response: '*'
			}]
		}, {
			module: 'good-squeeze',
			name: 'SafeJson'
		}, {
			module: 'good-file',
			args: ['./logs/' + new Date().getTime() + '.json']
		}]
	}
};

// Routes
require('routes')(server);

// Register and if no errors start the server
server.register({
	register: require('good'),
	options,
}, (err) => {

	// Error loading the configuration
	if (err) {
		return console.error(err);
	}

	// Starting the server
	server.start(() => {
		console.info('Server started @', server.info.uri);
	});
});