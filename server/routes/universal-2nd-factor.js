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
     * Method:  GET
     * Params:  email		- Email of the user
     *          password	- Password of the user
     * Returns: 
     */
	server.route({
		path: '/u2f/register',
		method: 'GET',
		config: {
			// Validate payload params before handler gets the load
			// validate: {
			// 	payload: {
			// 		// email: Joi.string().email().required()
			// 	}
			// },
			handler: function (request, reply) {


				var tokens = request.session.tokens || [];
				var appId = 'https://localhost:' + 8080;

				u2f.startRegistration(appId, tokens)
					.then(function (registrationRequest) {
						// Save registration request to session for later use
						request.session.registrationRequest = registrationRequest;

						console.log(registrationRequest.appId);
						console.log(registrationRequest.registerRequests);
						console.log(registrationRequest.registeredKeys);

						// Send registration request to client
						//reply.json(registrationRequest);
						return reply({ appId: registrationRequest.appId, registerRequests: registrationRequest.registerRequests, registeredKeys: registrationRequest.registeredKeys });

					}, function (error) {
						// Handle registration request error
						// reply.status(500).json(error);
						return reply({ statusCode: 500, error });
					});

				// if (request.payload.email == Config.test.email) {
				// Set flag that server is expecting to receive U2F in meantime
				// return reply({ statusCode: 200 });
				// } else {
				// return reply(Boom.badData('Incorrect login information.'));
				// }
			}
		}
	});

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

				console.log('\nREQUEST\n')
				console.log(request);

				console.log('\nREQUEST STATE REQUEST\n')
				console.log(request.session.registrationRequest);

				console.log('\nREGISTRATION REQUEST\n')
				console.log(registrationRequest);

				// Process registration response
				u2f.finishRegistration(request.session.registrationRequest, request.payload.registrationRequest)
					.then(function (registrationStatus) {
						// Save device meta structure for future authentication use
						var meta = {
							keyHandle: registrationStatus.keyHandle,
							publicKey: registrationStatus.publicKey,
							certificate: registrationStatus.certificate
						}
						console.log("\nMETA\n");
						console.log(meta);

						// console.log('\nSTATE\n');
						// console.log(request.state);

						if (!request.session.tokens) {
							request.session.tokens = [];
						}

						// Save newly registered token
						request.session.tokens.push(meta);
						return reply({ response: meta });

					}, function (error) {
						return reply({ statusCode: 500, error });
					});
			}
		}
	});

	server.route({
		path: '/u2f/login',
		method: 'GET',
		config: {
			// Validate payload params before handler gets the load
			// validate: {
			// 	payload: {
			// 		// email: Joi.string().email().required()
			// 	}
			// },
			handler: function (request, reply) {

				var tokens = request.session.tokens;
				var appId = 'https://localhost:' + 8080;

				u2f.startAuthentication(appId, tokens)
					.then(function (authenticationRequest) {
						// Save authentication request to session for later use
						request.session.authenticationRequest = authenticationRequest;
						// Send registration request to client
						return reply({ appId: authenticationRequest.appId, challenge: authenticationRequest.challenge, registeredKeys: authenticationRequest.registeredKeys });
					}, function (error) {
						// Handle registration request error
						// reply.status(500).json(error);
						return reply({ statusCode: 500, error });
					});

				// if (request.payload.email == Config.test.email) {
				// Set flag that server is expecting to receive U2F in meantime
				// return reply({ statusCode: 200 });
				// } else {
				// return reply(Boom.badData('Incorrect login information.'));
				// }
			}
		}
	});
};