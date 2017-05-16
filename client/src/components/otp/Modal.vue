<template>
	<div class="modal" v-bind:class="{ 'is-active' : isActive }">
		<div class="modal-background" v-on:click="close"></div>
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title">OPT - Insert the code from the app</p>
				<button class="delete" v-on:click="close"></button>
			</header>
			<section class="modal-card-body">
				<!-- Here will be a form in order to send the code to the server for validation -->
				<form v-on:submit.prevent="onSubmit">
					<div class="field">
						<p class="control has-icon">
							<input class="input is-medium" type="text" placeholder="Code" v-model="code" required>
							<span class="icon is-small">
								<i class="fa fa-key"></i>
							</span>
						</p>
					</div>
					<span class="help is-danger" v-text="error"></span>
					<div class="field">
						<p class="control">
							<button class="button is-primary is-medium is-fullwidth" type="submit">
								Validate
							</button>
						</p>
					</div>
				</form>
			</section>
		</div>
	</div>
</template>

<script>
export default {
	name: 'otp-modal',
	data: function () {
		return {
			code: '',
			error: ''
		};
	},
	props: {
		isActive: {
			type: Boolean,
			required: true
		}
	},
	methods: {
		onSubmit: function () {
			var self = this;

			Axios.post('https://localhost:9000/otp/code', {
				code: this.code
			})
				.then((response) => {
					Auth.user.authenticated = true;
					localStorage.setItem('session', response.data.jwt);

					self.$router.push({ path: 'profile' });
				})
				.catch(error => {
					self.error = error.response.data.message;
				});
		},
		close: function () {
			this.$emit('close');
		}
	}
}
</script>

<style scoped>
.control {
	margin-top: 1em;
}

.modal-card-foot {
	justify-content: flex-end !important;
}
</style>