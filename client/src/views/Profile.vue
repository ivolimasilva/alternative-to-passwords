<template>
	<div class="hero-body">
		<div class="container">
			<div class="container has-text-centered" v-if="error == ''">
				<h1 class="title is-1">User data</h1>
				<h2 class="subtitle is-3">ID: {{ user.id }}</h2>
				<h2 class="subtitle is-3">Private: {{ user.private }}</h2>
			</div>
			<div class="container has-text-centered" v-if="error != ''">
				<h2 class="subtitle is-3">{{ error }}</h2>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Profile',
	data: function () {
		return {
			user: {},
			error: ''
		}
	},
	mounted: function () {
		var self = this;

		Axios.get('https://localhost:9000/user', {
			params: {
				token: localStorage.getItem('session')
			}
		})
			.then((response) => {
				console.log(response);
				self.user = response.data.user;
			})
			.catch((error) => {
				console.log(error);
				self.error = 'Invalid authentication information';
			});
	}
}
</script>

<style scoped>

</style>