'use strict'

var Joi = require('joi'),
    Boom = require('boom'),
    Config = require('config'),
    Jwt = require('utils/jwt');

module.exports = function (server) {

    /*
     * Route to return user's private information if JWT is valid
     * Method:  GET
     * Params:  Cookie with valid JWT
     * Returns: 
     */
    server.route({
        path: '/user',
        method: 'GET',
        config: {
            validate: {
                query: {
                    token: Joi.required()
                }
            },
            handler: function (request, reply) {
                Jwt.verify(request.query.token)
                    .then((decoded) => {
                        return reply({ user: Config.test });
                    })
                    .catch((error) => {
                        return reply(Boom.badData('Incorrect token.'));
                    });
            }
        }
    });

};