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
				{{x}} and {{y}}
				</section>
			<footer class="modal-card-foot">
				<a class="button is-primary">Validate</a>
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
			coord: []
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
			console.log(style.width);
			console.log(style.height);


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
			this.coord.push({x: this.x, y: this.y});
			console.log(this.coord);
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