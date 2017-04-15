'use strict'

var Config = require('config'),
	Promise = require('bluebird');

/*
 * Function to search the list of users and return a promise based on the result
 *
 * Params:
 *  user: Object - Object with properties 'email' and 'password' required
 *
 * Returns:
 *  Promise 'resolve' if a user is found. Otherwise returns promise 'reject'.
 */
exports.search = function (user) {
	return new Promise(function (resolve, reject) {
		Config.users.forEach(function (_user) {
			if (user.email == _user.email && user.password == _user.password) {
				resolve();
			}
		});
		reject();
	});
};