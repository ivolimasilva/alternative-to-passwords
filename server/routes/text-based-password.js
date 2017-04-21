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
		path: '/tbp/login',
		method: 'POST',
		config: {
			// Validate payload params before handler gets the load
			validate: {
				payload: {
					email: Joi.string().email().required(),
					password: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/).required()
				}
			},
			handler: function (request, reply) {
				// Verify with the registred users
				if (request.payload.email == Config.test.email && request.payload.password == Config.test.password) {
					return reply({ statusCode: 200 });
				} else {
					return reply(Boom.badData('Incorrect login information.'));
				}
			}
		}
	});

};