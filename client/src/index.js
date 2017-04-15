// Modules
import Vue from 'vue';
import VueRouter from 'vue-router';

// Define Axios to global
window.Axios = require('axios');

// Vue modules
Vue.use(VueRouter);

import router from './router';

new Vue({
	router,
	el: '#app'
});