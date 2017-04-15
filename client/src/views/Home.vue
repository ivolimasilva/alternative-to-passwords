<template>
	<div class="hero-body">
		<div class="container">
			<div class="container has-text-centered">
				<h1 class="title is-1">Alternative to passwords</h1>
				<h2 class="subtitle is-3">A comparisson between different methods of authentication.</h2>
			</div>
			<div class="container">
				<div class="columns">
					<otp-login class="column"></otp-login>
					<u2f-login class="column"></u2f-login>
					<gua-login class="column"></gua-login>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import OTPLogin from '../components/otp/Login.vue';
import U2FLogin from '../components/u2f/Login.vue';
import GUALogin from '../components/gua/Login.vue';

export default {
	name: 'Home',
	components: {
		'otp-login': OTPLogin,
		'u2f-login': U2FLogin,
		'gua-login': GUALogin
	}
}
</script>

<style>
.is-fullheight {
	min-height: calc(100vh - 50px) !important;
}

.hero-body {
	margin-bottom: 25vh;
}

.hero-body .container .container {
	margin-top: 5vh;
	margin-bottom: 5vh;
}
</style>