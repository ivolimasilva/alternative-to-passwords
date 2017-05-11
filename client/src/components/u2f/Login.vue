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

import U2FModal from './Modal.vue'

function registerCallback(res) {
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
			// return reject('Unknown error: ' + res.errorCode);
		}
	}
	console.log("Posting U2F registration response")
	// $.post(paths.u2f.register, res, responseCallback);
}

// function responseCallback(data) {
// 	if (typeof data.error !== 'undefined') {
// 		console.log("Error: " + data.error);
// 		return reject(data.error);
// 	}
// 	console.log("U2F enrolment complete");
// 	resolve(data);
// }
export default
	{
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
				self.modalMessage = 'Insert key and press button to register.';
				self.modalIsActive = true;

				return new Promise(function (resolve, reject) {
					console.log("Requesting U2F registration challenge")
					// $.get(paths.u2f.register, { tokenName: tokenName }, requestCallback);
					Axios.get('https://localhost:9000/u2f/register', { tokenName: "" })
						.then(function (response) {
							self.error = '';
							console.log("Waiting for U2F input");
							console.log(response.data.appId);
							console.log(response.data.registerRequests);
							console.log(response.data.registeredKeys);

							u2f.register(response.data.appId, response.data.registerRequests, response.data.registeredKeys, registerCallback, 10);
							resolve();
						})
						.catch(error => {
							console.log("Axios get error");
							// self.error = error.response.data.message;
						})
				});

				// Axios.post('https://localhost:9000/u2f/register', {
				// })
				// 	.then(function (response) {
				// 		self.error = '';

				// 	})
				// 	.catch(error => {
				// 		self.error = error.response.data.message;
				// 	})
				// self.modal = false;
			},

			// onLogin: function () {
			// 	var self = this;
			// 	self.modalTitle = 'Login using a U2F device';
			// 	self.modalMessage = 'Insert key and press button to login.';
			// 	self.modalIsActive = true;

			// 	Axios.post('https://localhost:9000/u2f/login', {
			// 	})
			// 		.then(function (response) {
			// 			self.error = '';
			// 		})
			// 		.catch(error => {
			// 			self.error = error.response.data.message;
			// 		});
			// },
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