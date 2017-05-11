'use strict'

var Hapi = require('hapi'),
	Joi = require('joi'),
	Config = require('config'),
	Path = require('path');

// Create a server with validation
var server = new Hapi.Server({
	app: {
		validation: {
			allowUnknown: true
		}
	},
	connections: {
		routes: {
			files: {
				relativeTo: Path.join(__dirname, 'images')
			}
		}
	}

});

// Set the port and CORS to true
server.connection({
	port: Config.server.port,
	routes: {
		cors: true
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


// Register and if no errors start the server
server.register([{
	register: require('good'),
	options,
},
{ register: require('inert') }
],
	(err) => {

		// Error loading the configuration
		if (err) {
			return console.error(err);
		}


	});

// Routes
require('routes')(server);


// Starting the server
server.start(() => {
	console.info('Server started @', server.info.uri);
});
