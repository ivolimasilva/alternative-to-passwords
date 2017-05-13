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

				var tokens = JSON.parse(request.query.tokens.toString()) || [];
				var appId = 'https://localhost:' + 8080;
				console.log('tokens');
				console.log(tokens);

				u2f.startRegistration(appId, tokens)
					.then(function (registrationRequest) {
						// Save registration request in local storage for later use
						// localStorage.setItem('registrationRequest', registrationRequest);
						// request.session.registrationRequest = registrationRequest;
						console.log('dafuq');
						console.log(registrationRequest);
						console.log(registrationRequest.appId);
						console.log(registrationRequest.registerRequests);
						console.log(registrationRequest.registeredKeys);

						// Send registration request to client
						return reply({ registrationRequest: registrationRequest });

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

				console.log('\nPayload clientData\n')
				console.log(request.payload.clientData);

				console.log('\nPayload registrationRequest\n')
				console.log(request.payload.registrationRequest);

				// Process registration response
				u2f.finishRegistration(request.payload.registrationRequest, request.payload.clientData)
					.then(function (registrationStatus) {
						// Save device meta structure for future authentication use
						var meta = {
							keyHandle: registrationStatus.keyHandle,
							publicKey: registrationStatus.publicKey,
							certificate: registrationStatus.certificate
						}
						console.log("\nMETA\n");
						console.log(meta);

						return reply({ response: meta });

					}, function (error) {
						return reply({ statusCode: 500, error });
					});
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
		path: '/u2f/login',
		method: 'POST',
		config: {
			handler: function (request, reply) {
				var challenge = request.payload.challenge;
				var deviceResponse = request.payload.deviceResponse;
				var registeredKeys = request.payload.registeredKeys || [];

				console.log('\nLOGIN REQUEST\n')
				console.log(request);

				console.log('\nnLOGIN Payload challenge\n')
				console.log(request.payload.authenticationRequest);

				console.log('\nnLOGIN Payload deviceResponse\n')
				console.log(request.payload.deviceResponse);

				console.log('\nnLOGIN Payload deviceResponse\n')
				console.log(request.payload.registeredKeys);


				// Process registration response
				u2f.finishAuthentication(challenge, deviceResponse, registeredKeys)
					.then(function (authenticationStatus) {
						// Respond to user
						return reply({ authenticationStatus: authenticationStatus });

					}, function (error) {
						// Handle registration error
						return reply({ statusCode: 500, error });
					});
			}
		}
	});

	server.route({
		path: '/u2f/login',
		method: 'GET',
		config: {
			handler: function (request, reply) {

				var tokens = JSON.parse(request.query.tokens.toString()) || [];
				var appId = 'https://localhost:' + 8080;

				u2f.startAuthentication(appId, tokens)
					.then(function (authenticationRequest) {
						// Save authentication request to session for later use
						// Send registration request to client
						return reply({ authenticationRequest: authenticationRequest });
					}, function (error) {
						// Handle registration request error
						return reply({ statusCode: 500, error });
					});
			}
		}
	});
};