<template>
	<div>
		<div class="has-text-centered">
			<h1 class="title is-1">U2F</h1>
			<h2 class="subtitle is-3">Universal 2
				<sup>nd</sup> Factor</h2>
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
		registerCallback: function (res) {
			var self = this;
			console.log(res);
			if (typeof res.errorCode !== 'undefined') {
				if (res.errorCode == u2f.ErrorCodes.TIMEOUT) {
					console.log('Timed out waiting for user input');
					// return reject('Timed out waiting for user input');
				} else if (res.errorCode == u2f.ErrorCodes.BAD_REQUEST) {
					console.log('Bad U2F Request');
					// return reject('Bad U2F Request');
				} else if (res.errorCode == u2f.ErrorCodes.DEVICE_INELIGIBLE) {
					console.log('Device ineligible');
					// return reject('Device ineligible');
				} else {
					console.log('Unknown error');
					// return reject('Unknown error: ' + res.errorCode);
				}
			}
			console.log("Posting U2F registration response");
			// $.post(paths.u2f.register, res, responseCallback);

			return new Promise(function (resolve, reject) {
				Axios.post('https://localhost:9000/u2f/register', {
					registrationRequest: res
				})
					.then(function (response) {
						if (response.data.error !== undefined) {
							console.log("U2F registration failed: " + response.data.error);
						}
						else {
							console.log("Response to registration post:");
							console.log(response);
							console.log("U2F enrolment complete");
							self.closeModal();
							resolve(response);
						}
					})
					.catch(error => {
						console.log("Axios post error");
					});
			});
		},

		onRegister: function () {
			var self = this;
			self.modalTitle = 'U2F device registration';
			self.modalMessage = 'Insert key and press button to register.';
			self.modalIsActive = true;

			return new Promise(function (resolve, reject) {
				console.log("Requesting U2F registration challenge")
				// $.get(paths.u2f.register, { tokenName: tokenName }, requestCallback);
				Axios.get('https://localhost:9000/u2f/register', { tokenName: "" })
					.then(function (response) {
						console.log("Waiting for U2F input");
						console.log(response.data.appId);
						console.log(response.data.registerRequests);
						console.log(response.data.registeredKeys);
						u2f.register(response.data.appId, response.data.registerRequests, response.data.registeredKeys, self.registerCallback, 15);
					})
					.catch(error => {
						console.log("Axios get error");
						// self.error = error.response.data.message;
					})
			});
		},

		signatureCallBack: function (res) {
			var self = this;
			console.log(res);
			if (typeof res.errorCode !== 'undefined') {
				if (res.errorCode == u2f.ErrorCodes.TIMEOUT) {
					console.log('Timed out waiting for user input');
					// return reject('Timed out waiting for user input');
				} else if (res.errorCode == u2f.ErrorCodes.BAD_REQUEST) {
					console.log('Bad U2F Request');
					// return reject('Bad U2F Request');
				} else if (res.errorCode == u2f.ErrorCodes.DEVICE_INELIGIBLE) {
					console.log('Device ineligible');
					// return reject('Device ineligible');
				} else {
					console.log('Unknown error');
					// return reject('Unknown error: ' + res.errorCode);
				}
			}
			console.log("Posting U2F signature response")
			// $.post(paths.u2f.sign, res, responseCallback);
		},

		onLogin: function () {
			var self = this;
			self.modalTitle = 'Login using a U2F device';
			self.modalMessage = 'Insert key and press button to login.';
			self.modalIsActive = true;

			Axios.get('https://localhost:9000/u2f/login', {
			})
				.then(function (response) {
					console.log("Waiting for U2F input");
					console.log(response.data.appId);
					console.log(response.data.challenge);
					console.log(response.data.registeredKeys);
					u2f.sign(response.data.appId, response.data.challenge, response.data.registeredKeys, self.signatureCallBack, 15);
				})
				.catch(error => {
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