<template>
	<div class="modal" v-bind:class="{ 'is-active' : isActive }">
		<div class="modal-background" v-on:click="close"></div>
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title">{{ modalTitle }}</p>
				<button class="delete" v-on:click="close"></button>
			</header>
			<section class="modal-card-body">
				<div style="width:100%;">
					<div style="margin: 0 auto;">
						<img src="./u2f-device.png" style="max-height: 30%; max-width: 30%;" />
						<p>{{ modalMessage }} </p>
					</div>
				</div>
			</section>
			<footer class="modal-card-foot">
				<a class="button" v-on:click="close">Cancel</a>
			</footer>
		</div>
	</div>
</template>

<script>
export default {
	name: 'u2f-modal',
	props: {
		isActive: {
			type: Boolean,
			required: true
		},
		modalTitle: {
			type: String,
			default: ''
		},
		modalMessage: {
			type: String,
			default: ''
		}
	},
	methods: {
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