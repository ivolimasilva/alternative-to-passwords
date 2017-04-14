<template>
	<div class="columns">
		<otp-login></otp-login>
	</div>
</template>

<script>
import OTPLogin from '../components/otp/Login.vue';

export default {
	name: 'Home',
	data: function () {
		return {};
	},
	components: {
		OTPLogin
	},
	mounted() {
		console.log('Home mounted');
	}
}
</script>

<style>

</style>