'use strict'

var Joi = require('joi'),
	Boom = require('boom'),
	Config = require('config'),
	Promise = require('bluebird'),
	Path = require('path'),
	Inert = require('inert');

module.exports = function (server) {

    /*
     * Route for te first form authentication
     * Method:  POST
     * Params:  email		- Email of the user
     *          password	- Password of the user
     * Returns: 
     */
	server.route({
		path: '/gua/login',
		method: 'POST',
		config: {
			// Validate payload params before handler gets the load
			validate: {
				payload: {
					email: Joi.string().email().required()
				}
			},
			handler: function (request, reply) {
				if (request.payload.email == Config.test.email) {
					// Generate Code
					// Send code to mobile app
					var imageauthUrl = Path.resolve('./images/test_image.jpg');
					console.log(imageauthUrl);
					return reply({ imageauth: 'http://localhost:9000/images/test_image.jpg' });

				} else {
					return reply(Boom.badData('Incorrect login information.'));
				}
			}
		}
	});

	server.route({
		method: 'GET',
		path: '/images/{param*}',
		handler: {
			directory: {
				path: '.',
				redirectToSlash: true,
				index: true
			}
		}
	});
};