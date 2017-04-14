module.exports = function (server) {
	require('routes/one-time-password')(server);
	require('routes/universal-2nd-factor')(server);
	require('routes/graphical-user-auth')(server);
};