<template>
	<div class="hero-body">
		<div class="container">
			<div class="container has-text-centered">
				<h1 class="title is-1">Alternative to passwords</h1>
				<h2 class="subtitle is-3">A comparisson between different methods of authentication.</h2>
			</div>
			<div class="container">
				<div class="columns">
					<tbp-login class="column pull-bottom"></tbp-login>
					<otp-login class="column pull-bottom"></otp-login>
					<u2f-login class="column pull-bottom"></u2f-login>
					<gua-login class="column pull-bottom"></gua-login>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import TBPLogin from '../components/tbp/Login.vue';
import OTPLogin from '../components/otp/Login.vue';
import U2FLogin from '../components/u2f/Login.vue';
import GUALogin from '../components/gua/Login.vue';

export default {
	name: 'Home',
	components: {
		'tbp-login': TBPLogin,
		'otp-login': OTPLogin,
		'u2f-login': U2FLogin,
		'gua-login': GUALogin
	}
}
</script>

<style scoped>
@media only screen and (min-width: 760px) {
	.hero-body {
		margin-bottom: 25vh;
	}
}

.hero-body .container .container {
	margin-top: 5vh;
	margin-bottom: 5vh;
}

.pull-bottom {
	margin-top: auto;
}
</style>