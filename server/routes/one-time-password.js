'use strict'

var Joi = require('joi'),
	Boom = require('boom'),
	Config = require('config'),
	Auth = require('utils/auth'),
	Promise = require('bluebird');

module.exports = function (server) {

    /*
     * Route for te first form authentication
     * Method:  POST
     * Params:  email		- Email of the user
     *          password	- Password of the user
     * Returns: 
     */
	server.route({
		path: '/otp/login',
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
					return reply({ statusCode: 200 });
				} else {
					return reply(Boom.badData('Incorrect login information.'));
				}
			}
		}
	});

};