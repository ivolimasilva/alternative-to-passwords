'use strict'

var Joi = require('joi'),
	Boom = require('boom'),
	Config = require('config'),
	Promise = require('bluebird'),
	Path = require('path'),
	Inert = require('inert'),
	Jwt = require('utils/jwt');

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
					email: Joi.string().email().required()
				}
			},
			handler: function (request, reply) {
				if (request.payload.email == Config.test.email) {
					// Generate Code
					// Send code to mobile app
					var imageauthUrl = Path.resolve('./images/test_image.jpg');
					console.log(imageauthUrl);
					return reply({ imageauth: 'http://localhost:9000/images/test_image.jpg' });
				}
				else {
					return reply(Boom.badData('Incorrect login information.'));
				}
			}
		}
	});
	server.route({
		path: '/gua/point',
		method: 'POST',
		config: {
			// Validate payload params before handler gets the load

			validate: {
				payload: {
					coord: Joi.array().length(Config.test.coordinates.length).required()
				}
			},

			handler: function (request, reply) {

				var flag = false;
				for (var i in request.payload.coord) {
					if ((request.payload.coord[i].x > (Config.test.coordinates[i].x + 50) || request.payload.coord[i].x < (Config.test.coordinates[i].x - 50))
						|| (request.payload.coord[i].y > (Config.test.coordinates[i].y + 50) || request.payload.coord[i].y < (Config.test.coordinates[i].y - 50))) {
						flag = true;
						return reply(Boom.badRequest('The graphical password is wrong.'));
					}
				}
				if (!flag) {
					Jwt.encode(Config.test.id)
						.then((encoded) => {
							return reply({ jwt: encoded });
						})
						.catch((err) => {
							return reply(Boom.badImplementation('Code monkeys bro.'));
						});
				}
			}
		}
	});


	server.route({
		method: 'GET',
		path: '/images/{param*}',
		handler: {
			directory: {
				path: '.',
				redirectToSlash: true,
				index: true
			}
		}
	});


};