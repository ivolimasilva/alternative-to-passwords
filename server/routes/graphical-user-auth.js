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
		path: '/gua/login',
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
				Auth.search(request.payload)
					.then(function () {
						return reply({ statusCode: 200 });

						// TODO: Reply with the URL of this user's image
					})
					.catch(function () {
						return reply(Boom.badData('Incorrect login information.'));
					});
			}
		}
	});

};