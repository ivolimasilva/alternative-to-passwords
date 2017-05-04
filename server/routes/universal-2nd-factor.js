'use strict'

var Joi = require('joi'),
	Boom = require('boom'),
	Config = require('config'),
	// Auth = require('utils/auth'),
	// https = require('https'),
	u2f = require('authdog'),
	Promise = require('bluebird');

module.exports = function (server) {

	/*
     * Route for the U2F device registration
     * Method:  POST
     * Params:  email		- Email of the user
     *          password	- Password of the user
     * Returns: 
     */
	server.route({
		path: '/u2f/register',
		method: 'POST',
		config: {
			// Validate payload params before handler gets the load
			// validate: {
			// 	payload: {
			// 		// email: Joi.string().email().required()
			// 	}
			// },
			handler: function (request, reply) {
				// if (request.payload.email == Config.test.email) {
					// Set flag that server is expecting to receive U2F in meantime
					 return reply({ statusCode: 200 });
				// } else {
					// return reply(Boom.badData('Incorrect login information.'));
				// }
			}
		}
	});

	/*
	 * Route for the U2F authentication
	 * Method:  POST
	 * Params:  email		- Email of the user
	 *          password	- Password of the user
	 * Returns: 
	 */
	server.route({
		path: '/u2f/login',
		method: 'POST',
		config: {
			// Validate payload params before handler gets the load
			// validate: {
			// 	payload: {
			// 		email: Joi.string().email().required()
			// 	}
			// },
			handler: function (request, reply) {
				// if (request.payload.email == Config.test.email) {
					// Set flag that server is expecting to receive U2F in meantime
					return reply({ statusCode: 200 });
				// } else {
				// 	return reply(Boom.badData('Incorrect login information.'));
				// }
			}
		}
	});
};