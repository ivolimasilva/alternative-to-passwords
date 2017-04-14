import VueRouter from 'vue-router';

let routes = [
	{
		path: '/',
		component: require('./views/Home.vue')
	},
	{
		path: '/profile',
		component: require('./views/Profile.vue')
	}
];

export default new VueRouter({
	mode: 'history',
	base: __dirname,
	routes,
	linkActiveClass: 'is-active'
});