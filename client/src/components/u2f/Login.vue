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
					<p class="control">
						<button class="button is-primary is-medium is-fullwidth" type="submit">
							Register U2F device
						</button>
					</p>
					<span class="help is-danger" v-text="registerError"></span>
				</div>
			</form>
	
			<form v-on:submit.prevent="onLogin">
				<div class="field">
					<p class="control">
						<button class="button is-primary is-medium is-fullwidth" type="submit">
							Login
						</button>
					</p>
					<span class="help is-danger" v-text="loginError"></span>
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
			registerError: '',
			loginError: '',
			modalIsActive: false,
			modalTitle: '',
			modalMessage: ''
		};
	},
	methods: {
		registerCallback: function registerCallback(registerRequestResponse) {
			var self = this;
			self.closeModal();
			console.log(registerRequestResponse);

			if (typeof registerRequestResponse.errorCode !== 'undefined') {
				self.registerError = 'U2F device registration error: ';
				if (registerRequestResponse.errorCode == u2f.ErrorCodes.TIMEOUT) {
					console.log('Timed out waiting for user input');
					self.registerError += 'Timed out waiting for user input';
					return;
				} else if (registerRequestResponse.errorCode == u2f.ErrorCodes.BAD_REQUEST) {
					console.log('Bad U2F Request');
					self.registerError += 'Bad U2F Request';
					return;
				} else if (registerRequestResponse.errorCode == u2f.ErrorCodes.DEVICE_INELIGIBLE) {
					console.log('Device ineligible');
					self.registerError += 'Device ineligible';
					return;
				} else {
					console.log('Unknown error');
					self.registerError += 'Unknown error: ' + registerRequestResponse.errorCode;
					return;
				}
			}
			console.log("Posting U2F registration response");
			console.log(JSON.parse(localStorage.getItem('u2fRegistrationRequest')));

			return new Promise(function (resolve, reject) {
				Axios.post('https://localhost:9000/u2f/register', {
					registrationResponse: registerRequestResponse,
					registrationRequest: JSON.parse(localStorage.getItem('u2fRegistrationRequest'))
				})
					.then(function (response) {
						if (response.data.error !== undefined) {
							console.log("U2F registration failed: " + response.data.error);
							self.registerError = "U2F registration failed: " + response.data.error;
						}
						else {
							console.log("Response to registration post:");
							console.log(response);
							// Save newly registered token
							var tmpTokens = JSON.parse(localStorage.getItem('u2fRegisteredKeys'));
							tmpTokens.push(response.data.response);
							localStorage.setItem("u2fRegisteredKeys", JSON.stringify(tmpTokens));
							console.log("U2F enrolment complete");
							self.registerError = '';
							self.loginError = '';
							resolve(response);
						}
					})
					.catch(error => {
						console.log("U2F register POST error: " + error);
						self.registerError = "U2F register POST error: " + error;
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

				if (!localStorage.getItem('u2fRegisteredKeys')) {
					var tmpTokens = [];
					localStorage.setItem("u2fRegisteredKeys", JSON.stringify(tmpTokens));
					console.log(localStorage.getItem('u2fRegisteredKeys'));
				}

				Axios.get('https://localhost:9000/u2f/register', {
					params: {
						registeredKeys: localStorage.getItem('u2fRegisteredKeys')
					}
				})
					.then(function (response) {
						console.log("Waiting for U2F input");
						var registrationRequest = response.data.registrationRequest;
						console.log(registrationRequest.appId);
						console.log(registrationRequest.registerRequests);
						console.log(registrationRequest.registeredKeys);

						// locally store registration request
						localStorage.setItem('u2fRegistrationRequest', JSON.stringify(registrationRequest));
						u2f.register(registrationRequest.appId, registrationRequest.registerRequests, registrationRequest.registeredKeys, self.registerCallback, 15);
					})
					.catch(error => {
						console.log("U2F register GET error: " + error);
						self.registerError = "U2F register GET error: " + error;
						// try to also abort registerCallback?
					})
			});
		},

		signatureCallBack: function (signRequestResponse) {
			var self = this;
			self.closeModal();
			console.log(signRequestResponse);

			if (typeof signRequestResponse.errorCode !== 'undefined') {
				self.loginError = 'U2F device login error: ';
				if (signRequestResponse.errorCode == u2f.ErrorCodes.TIMEOUT) {
					console.log('Timed out waiting for user input');
					self.loginError += 'Timed out waiting for user input';
					return;
				} else if (signRequestResponse.errorCode == u2f.ErrorCodes.BAD_REQUEST) {
					console.log('Bad U2F Request');
					self.loginError += 'Bad U2F Request';
					return;
				} else if (signRequestResponse.errorCode == u2f.ErrorCodes.DEVICE_INELIGIBLE) {
					console.log('Device ineligible');
					self.loginError += 'Device ineligible';
					return;
				} else {
					console.log('Unknown error');
					self.loginError += 'Unknown error: ' + signRequestResponse.errorCode;
					return;
				}
			}
			console.log("Posting U2F signature response")

			return new Promise(function (resolve, reject) {
				Axios.post('https://localhost:9000/u2f/login', {
					challenge: JSON.parse(localStorage.getItem('u2fAuthenticationRequest')),
					deviceResponse: signRequestResponse,
					registeredKeys: JSON.parse(localStorage.getItem('u2fRegisteredKeys'))
				})
					.then(function (response) {
						if (response.data.error !== undefined) {
							console.log("U2F authentication failed: " + response.data.error);
							self.loginError = "U2F authentication failed: " + response.data.error;
						}
						else {
							console.log("U2F login successful");
							console.log(response);
							self.registerError = '';
							self.loginError = '';
							resolve(response);
						}
					})
					.catch(error => {
						console.log("U2F login POST error: " + error);
						self.loginError = "U2F login POST error: " + error;
					});
			});
		},

		onLogin: function () {
			var self = this;
			self.modalTitle = 'Login using a U2F device';
			self.modalMessage = 'Insert key and press button to login.';
			self.modalIsActive = true;

			Axios.get('https://localhost:9000/u2f/login', {
				params: {
					registeredKeys: localStorage.getItem('u2fRegisteredKeys')
				}
			})
				.then(function (response) {
					console.log("Waiting for U2F input");
					var authenticationRequest = response.data.authenticationRequest;
					console.log(authenticationRequest);

					// locally store authentication request
					localStorage.setItem("u2fAuthenticationRequest", JSON.stringify(authenticationRequest));
					u2f.sign(authenticationRequest.appId, authenticationRequest.challenge, authenticationRequest.registeredKeys, self.signatureCallBack, 15);
				})
				.catch(error => {
					console.log("U2F login GET error: " + error);
					self.loginError = "U2F login POST error: " + error;
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