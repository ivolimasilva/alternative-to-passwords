// Modules
import Vue from 'vue';
import VueRouter from 'vue-router';

// Define Axios to global
window.Axios = require('axios');
window.Axios.defaults.headers.common = {
	'X-Requested-With': 'XMLHttpRequest'
};

// Vue modules
Vue.use(VueRouter);

import router from './router';

new Vue({
	router,
	el: '#app'
});