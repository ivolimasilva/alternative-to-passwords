'use strict'

var Joi = require('joi'),
	Boom = require('boom'),
	Config = require('config'),
	Promise = require('bluebird'),
	Nodemailer = require('nodemailer');

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
					var transporter = Nodemailer.createTransport({
						service: Config.email.service,
						auth: {
							user: Config.email.user,
							pass: Config.email.password
						}
					});

					// Return status OK
					return reply({ statusCode: 200 });
				} else {
					return reply(Boom.badData('Incorrect login information.'));
				}
			}
		}
	});

};