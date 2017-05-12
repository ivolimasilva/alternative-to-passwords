'use strict'

var Joi = require('joi'),
	Boom = require('boom'),
	Config = require('config'),
	Jwt = require('utils/jwt'),
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

					Jwt.encode(Config.test.id)
						.then(function (encoded) {
							return reply({ jwt: encoded });
						})
						.catch(function (err) {
							return reply(Boom.badImplementation('Code monkeys bro.'));
						});

				} else {
					return reply(Boom.badData('Incorrect login information.'));
				}
			}
		}
	});

};