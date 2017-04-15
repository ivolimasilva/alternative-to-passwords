<template>
	<div>
		<div class="has-text-centered">
			<h1 class="title is-1">OTP</h1>
			<h2 class="subtitle is-3">One Time Password</h2>
		</div>
		<div>
			<form v-on:submit.prevent="onSubmit">
				<div class="field">
					<p class="control has-icon">
						<input class="input is-medium"
						       type="email"
						       placeholder="Email"
						       v-model="email"
						       required>
						<span class="icon is-small">
							<i class="fa fa-envelope"></i>
						</span>
					</p>
				</div>
				<div class="field">
					<p class="control has-icon">
						<input class="input is-medium"
						       type="password"
						       placeholder="Password"
						       v-model="password"
						       required>
						<span class="icon is-small">
							<i class="fa fa-lock"></i>
						</span>
					</p>
				</div>
				<span class="help is-danger"
				      v-text="error"></span>
				<div class="field">
					<p class="control">
						<button class="button is-primary is-medium is-fullwidth"
						        type="submit">
							Login
						</button>
					</p>
				</div>
			</form>
		</div>
		<otp-modal v-bind:is-active="modal"
		           v-on:close="closeModal"></otp-modal>
	</div>
</template>

<script>
import OTPModal from './Modal.vue';

export default {
	name: 'otp-login',
	components: {
		'otp-modal': OTPModal
	},
	data: function () {
		return {
			email: '',
			password: '',
			error: '',
			modal: false
		};
	},
	methods: {
		onSubmit: function () {
			var self = this;

			Axios.post('http://localhost:9000/otp/login', {
				email: this.email,
				password: this.password
			})
				.then(function (response) {
					self.error = '';
					// TODO
					self.modal = true;
				})
				.catch(error => {
					self.error = error.response.data.message;
				});
		},
		closeModal: function () {
			this.modal = false;
		}
	}
}
</script>

<style>
.control {
	margin-top: 1em;
}
</style>