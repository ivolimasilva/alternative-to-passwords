<template>
	<div class="modal"
	     v-bind:class="{ 'is-active' : isActive }">
		<div class="modal-background"
		     v-on:click="close"></div>
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title">GUA - Click the secret points of your image</p>
				<button class="delete"
				        v-on:click="close"></button>
			</header>
			<section class="modal-card-body">
				<!-- Here will be an image and this component will listen to where the user clicks in order to send those coordinates to the server for validation -->
			</section>
			<footer class="modal-card-foot">
				<a class="button is-primary">Validate</a>
				<a class="button"
				   v-on:click="close">Cancel</a>
			</footer>
		</div>
	</div>
</template>

<script>
export default {
	name: 'gua-modal',
	data: function () {
		return {
			code: ''
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
		},
		close: function () {
			this.$emit('close');
		}
	}
}
</script>

<style>
.control {
	margin-top: 1em;
}

.modal-card-foot {
	justify-content: flex-end !important;
}
</style>