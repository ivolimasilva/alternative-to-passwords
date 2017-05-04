<template>
	<div>
		<div class="has-text-centered">
			<h1 class="title is-1">TBP</h1>
			<h2 class="subtitle is-3">Text based password</h2>
		</div>
		<div>
			<form v-on:submit.prevent="onSubmit">
				<div class="field">
					<p class="control has-icon">
						<input class="input is-medium" type="email" placeholder="Email" v-model="email" required>
						<span class="icon is-small">
									<i class="fa fa-envelope"></i>
								</span>
					</p>
				</div>
				<div class="field">
					<p class="control has-icon">
						<input class="input is-medium" type="password" placeholder="Password" v-model="password" required>
						<span class="icon is-small">
									<i class="fa fa-lock"></i>
								</span>
					</p>
				</div>
				<span class="help is-danger" v-text="error"></span>
				<div class="field">
					<p class="control">
						<button class="button is-primary is-medium is-fullwidth" type="submit">
							Login
						</button>
					</p>
				</div>
			</form>
		</div>
	</div>
</template>

<script>
export default {
	name: 'tbp-login',
	components: {
	},
	data: function () {
		return {
			email: '',
			password: '',
			error: ''
		};
	},
	methods: {
		onSubmit: function () {
			var self = this;

			Axios.post('https://localhost:9000/tbp/login', {
				email: this.email,
				password: this.password
			})
				.then(function (response) {
					self.error = '';
					// TODO
					console.log(response.data.jwt);

					Auth.user.authenticated = true;
					localStorage.setItem('jwt', response.data.jwt);
				})
				.catch(error => {
					self.error = error.response.data.message;
				});
		}
	}
}
</script>

<style scoped>
.control {
	margin-top: 1em;
}
</style>