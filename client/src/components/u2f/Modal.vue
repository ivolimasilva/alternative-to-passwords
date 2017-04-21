<template>
	<div class="modal"
	     v-bind:class="{ 'is-active' : isActive }">
		<div class="modal-background"
		     v-on:click="close"></div>
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title">U2F - Insert your device key</p>
				<button class="delete"
				        v-on:click="close"></button>
			</header>
			<section class="modal-card-body">
				<!-- Here maybe a icon of a device key? This form has no validate button because that event should be triggered by the insertation of the device key -->
				<p>Waiting for U2F Key to be inserted.</p>
			</section>
			<footer class="modal-card-foot">
				<a class="button"
				   v-on:click="close">Cancel</a>
			</footer>
		</div>
	</div>
</template>

<script>
export default {
	name: 'u2f-modal',
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