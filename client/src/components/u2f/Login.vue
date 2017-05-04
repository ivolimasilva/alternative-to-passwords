<template>
	<div>
		<div class="has-text-centered">
			<h1 class="title is-1">U2F</h1>
			<h2 class="subtitle is-3">Universal 2<sup>nd</sup> Factor</h2>
		</div>
		<div>
			<form v-on:submit.prevent="onRegister">
				<div class="field">
					<span class="help is-danger" v-text="error"></span>
					<p class="control">
						<button class="button is-primary is-medium is-fullwidth" type="submit">
							Register U2F device
						</button>
					</p>
				</div>
			</form>
			<form v-on:submit.prevent="onLogin">
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
		<u2f-modal v-bind:is-active="modalIsActive" v-bind:modalTitle="modalTitle" v-bind:modalMessage="modalMessage" v-on:close="closeModal"></u2f-modal>
	</div>
</template>

<script>
import U2FModal from './Modal.vue';

export default {
	name: 'u2f-login',
	components: {
		'u2f-modal': U2FModal
	},
	data: function () {
		return {
			// email: '',
			error: '',
			modalIsActive: false,
			modalTitle: '',
			modalMessage: ''
		};
	},
	methods: {
		onRegister: function () {
			var self = this;
			self.modalTitle = 'U2F device registration';
			self.modalMessage = 'Insert key and press button.';
			self.modalIsActive = true;

			Axios.post('https://localhost:9000/u2f/register', {
			})
				.then(function (response) {
					self.error = '';

				})
				.catch(error => {
					self.error = error.response.data.message;
				})
			// self.modal = false;
		},

		onLogin: function () {
			var self = this;

			Axios.post('https://localhost:9000/u2f/login', {
			})
				.then(function (response) {
					self.error = '';
				})
				.catch(error => {
					self.error = error.response.data.message;
				});
		},
		closeModal: function () {
			this.modalIsActive = false;
			this.modalTitle = '';
			this.modalMessage = '';
		}
	}
}
</script>

<style>
.control {
	margin-top: 1em;
}
</style>