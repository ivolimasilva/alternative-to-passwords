// Modules
import Vue from 'vue';
import VueRouter from 'vue-router';
import Auth from './auth';

// Define Axios to global
window.Axios = require('axios');

// Define Auth to global
window.Auth = Auth;

// Vue modules
Vue.use(VueRouter);

import router from './router';

new Vue({
	router,
	el: '#app'
});