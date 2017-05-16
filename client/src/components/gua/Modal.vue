<template>
	<div class="modal" v-bind:class="{ 'is-active' : isActive }">
		<div class="modal-background" v-on:click="close"></div>
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title">GUA - Click the secret points of your image</p>
				<button class="delete" v-on:click="close"></button>
			</header>
			<section class="modal-card-body">
				<img :src="imageUrl" id="imagetest" v-on:click="getCoordinates" ref="myimg" />
				<!-- Here will be an image and this component will listen to where the user clicks in order to send those coordinates to the server for validation -->
				<p> You have selected {{coord.length}} points from the image. </p>
				<span class="help is-danger is-pulled-left" v-text="error"></span>
			</section>
			<footer class="modal-card-foot">
				<button class="button is-primary" v-on:click="onSubmit">Validate</button>
				<a class="button" v-on:click="close">Cancel</a>
			</footer>
		</div>
	</div>
</template>

<script>
export default {
	name: 'gua-modal',
	data: function () {
		return {
			code: '',
			x: 0,
			y: 0,
			coord: [],
			error: ''
		};
	},
	props: {
		isActive: {
			type: Boolean,
			required: true
		},
		imageUrl: {
			type: String
		}
	},
	methods: {
		onSubmit: function () {
			var self = this;
			Axios.post('https://localhost:9000/gua/point', {
				coord: this.coord
			})
				.then(function (response) {
					Auth.user.authenticated = true;
					localStorage.setItem('session', response.data.jwt);
					self.$router.push({ path: 'profile' });
				})
				.catch(error => {
					self.coord = [];
					self.error = error.response.data.message;
				});
		},
		findPosition: function (oElement) {
			if (typeof (oElement.offsetParent) != "undefined") {
				for (var posX = 0, posY = 0; oElement; oElement = oElement.offsetParent) {
					posX += oElement.offsetLeft;
					posY += oElement.offsetTop;
				}
				return [posX, posY];
			}
			else {
				return [oElement.x, oElement.y];
			}
		},
		getCoordinates: function (e) {
			var PosX = 0;
			var PosY = 0;
			var ImgPos;
			ImgPos = this.findPosition(this.$refs.myimg);

			var style = getComputedStyle(this.$refs.myimg);


			if (!e) var e = window.event;
			if (e.pageX || e.pageY) {
				PosX = e.pageX;
				PosY = e.pageY;
			}
			else if (e.clientX || e.clientY) {
				PosX = e.clientX + document.body.scrollLeft
					+ document.documentElement.scrollLeft;
				PosY = e.clientY + document.body.scrollTop
					+ document.documentElement.scrollTop;
			}
			PosX = PosX - ImgPos[0];
			PosY = PosY - ImgPos[1];
			this.x = PosX;
			this.y = PosY;
			this.coord.push({ x: this.x, y: this.y });
			//console.log(this.coord);
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

#imgtest {
	display: block !important;
	min-width: 600px !important;
	min-height: 400px !important;
	max-width: 600px !important;
	max-height: 400px !important;
}
</style>