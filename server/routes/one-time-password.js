'use strict'

var Joi = require('joi'),
	Boom = require('boom'),
	Config = require('config'),
	Jwt = require('utils/jwt'),
	Promise = require('bluebird'),
	OTP = require('otp-generator'),
	Nodemailer = require('nodemailer');

var code = null;

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
					code = OTP.generate(6, {
						upperCase: false,
						specialChars: false
					}).toUpperCase();

					// Start transporter
					var transporter = Nodemailer.createTransport({
						service: Config.email.service,
						auth: {
							user: Config.email.user,
							pass: Config.email.password
						}
					});

					// Email configuration
					var mailOptions = {
						from: 'SSIN',
						to: Config.test.send,
						subject: 'OTP Code',
						html: `
							<h1>Authentication Code</h1>
							<h2>` + code + `</h2>
						`,
						text: 'Authentication code: ' + code
					};

					// Send code by email
					transporter.sendMail(mailOptions, (err, info) => {
						if (err) {
							return reply(Boom.badImplementation('Error sending email with authentication code.'));
						} else {
							// Return status OK
							return reply({ statusCode: 200 });
						}
					});

				} else {
					return reply(Boom.badData('Incorrect login information.'));
				}
			}
		}
	});

	server.route({
		path: '/otp/code',
		method: 'POST',
		config: {
			validate: {
				payload: {
					code: Joi.string().regex(/^[a-zA-Z0-9]{6}$/).required()
				}
			},
			handler: (request, reply) => {
				if (code == null || code == '') {
					return reply(Boom.badRequest('Your code is not available.'));
				} else {
					if (request.payload.code == code) {

						Jwt.encode(Config.test.id)
							.then((encoded) => {
								code = null;
								return reply({ jwt: encoded });
							})
							.catch((err) => {
								return reply(Boom.badImplementation('Code monkeys bro.'));
							});

					} else {
						return reply(Boom.badRequest('Wrong code.'));
					}
				}
			}
		}
	});

};