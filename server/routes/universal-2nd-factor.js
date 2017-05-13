'use strict'

var Joi = require('joi'),
	Boom = require('boom'),
	Config = require('config'),
	u2f = require('authdog'),
	Promise = require('bluebird'),
	appId = 'https://localhost:' + 8080;

module.exports = function (server) {
	/*
     * Route for the U2F device registration
     * Method:  GET
	 * Params:  registeredKeys - Previously locally stored registered keys in the client
     * Returns: 
     */
	server.route({
		path: '/u2f/register',
		method: 'GET',
		config: {
			validate: {
				query: {
					registeredKeys: Joi.required()
				}
			},
			handler: function (request, reply) {

				var registeredKeys = JSON.parse(request.query.registeredKeys.toString());

				u2f.startRegistration(appId, registeredKeys)
					.then(function (registrationRequest) {
						// Send registration request to client
						return reply({ registrationRequest: registrationRequest });
					}, function (error) {
						// Handle registration request error
						return reply({ statusCode: 500, error });
					});
			}
		}
	});

	/*
	 * Route for the U2F device registration
	 * Method:  POST
	 * Params:  registrationRequest - U2F registration request
	 *          registrationResponse - Client response to the registration request
	 * Returns: 
	 */
	server.route({
		path: '/u2f/register',
		method: 'POST',
		config: {
			validate: {
				payload: {
					registrationRequest: Joi.required(),
					registrationResponse: Joi.required()
				}
			},
			handler: function (request, reply) {
				// Process registration response
				u2f.finishRegistration(request.payload.registrationRequest, request.payload.registrationResponse)
					.then(function (registrationStatus) {
						// Save device meta structure for future authentication use
						var meta = {
							keyHandle: registrationStatus.keyHandle,
							publicKey: registrationStatus.publicKey,
							certificate: registrationStatus.certificate
						}
						return reply({ response: meta });
					}, function (error) {
						return reply({ statusCode: 500, error });
					});
			}
		}
	});

	/*
	 * Route for the U2F device login
	 * Method:  GET
	 * Params:  registeredKeys - Previously locally stored registered keys in the client    
	 * Returns: 
	 */
	server.route({
		path: '/u2f/login',
		method: 'GET',
		config: {
			validate: {
				query: {
					registeredKeys: Joi.required()
				}
			},
			handler: function (request, reply) {
				var registeredKeys = JSON.parse(request.query.registeredKeys.toString());

				u2f.startAuthentication(appId, registeredKeys)
					.then(function (authenticationRequest) {
						// Send authentication request to client
						return reply({ authenticationRequest: authenticationRequest });
					}, function (error) {
						// Handle authentication request error
						return reply({ statusCode: 500, error });
					});
			}
		}
	});

	/*
	 * Route for the U2F device login
	 * Method:  POST
	 * Params:  challenge - Previously issued sign challenge
	 * 			deviceResponse - U2F device response to the sign request
	 *          registeredKeys - Previously locally stored registered keys in the client
	 * Returns: 
	 */
	server.route({
		path: '/u2f/login',
		method: 'POST',
		config: {
			validate: {
				payload: {
					challenge: Joi.required(),
					deviceResponse: Joi.required(),
					registeredKeys: Joi.required()
				}
			},
			handler: function (request, reply) {
				var challenge = request.payload.challenge;
				var deviceResponse = request.payload.deviceResponse;
				var registeredKeys = request.payload.registeredKeys;

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
};