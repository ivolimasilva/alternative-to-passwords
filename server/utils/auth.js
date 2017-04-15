'use strict'

var Config = require('config'),
	Promise = require('bluebird')

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