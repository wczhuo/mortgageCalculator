<template>
	<view class="content flex-column">
		<view class="video-box">
			<video :src="current.file" autoplay="true" object-fit="contain" @ended="playEnded"
				@timeupdate="playTimeupdate"></video>
		</view>
		<view>服务器地址：<input v-model="current.server" @input="serverInput" /></view>
		<view>服务器接口地址：<input v-model="current.api" @input="apiInput" /></view>
		<view>
			<button @tap="refresh">刷新</button>
		</view>
		<view class="list-box flex-row">
			<view class="video-list flex-column">
				<view v-for="(item,index) in videoList" class="item" :class="current.video == item.name ? 'active' : ''"
					@tap="selectVideo(item, index)">{{item.name}}
				</view>
			</view>
			<view class="file-list flex-column">
				<view v-for="(item,index) in fileList" class="item" :class="current.file == item.name ? 'active' : ''"
					@tap="playVideo(item, index)">{{item.name}}
				</view>
			</view>
		</view>
		<view class="fill-box-60"></view>
	</view>
</template>

<script>
	import {
		navigateTo
	} from '@/static/js/common';
	export default {
		data() {
			return {
				innerAudioContext: uni.createInnerAudioContext(),
				current: {
					// server: "http://localhost:8081",
					// api: "http://localhost",
					server: "http://192.168.2.15:8081",
					api: "http://192.168.2.15",
					duration: 0,
					currentTime: 0,
					seek: 0,
					state: 'play', // pause
					file: 'http://192.168.2.15:8081/电视剧/人世间/[阳光电影-www.ygdy8.com]人世间-01.mp4',
					index: 0,
					mode: 'asc',
					playMode: 'asc', // random asc desc single
				},
				videoList: [{
						name: '123123'
					},
					{
						name: '123123'
					},
					{
						name: '123123'
					},
					{
						name: '123123'
					},
				],
				fileList: [{
						name: '456456'
					},
					{
						name: '456456'
					},
					{
						name: '456456'
					},
					{
						name: '456456'
					},
				],
				max: 100,
				min: 0,
				process: {
					slideBarWidth: 670,
					minScore: this.min ? this.min : 0,
					maxScore: this.max ? this.max : 100,
					score: 0,
					x: 0,
					y: 0,
				},
				setSeek: true,
				systemInfo: uni.getSystemInfoSync(),
				processWidth: 0,
			}
		},
		onLoad() {
			let that = this;
			that.getVideoList();

			if (uni.getStorageSync('video.current')) {
				let current = uni.getStorageSync('video.current');
				// 避免新增的字段在覆盖时丢失
				for (var i in current) {
					that.current[i] = current[i];
				}
			}
			console.log('current ', JSON.stringify(uni.getStorageSync('video.current')));
			console.log('current ', JSON.stringify(that.current));

			if (!that.current.file) {
				that.current.file = that.fileList[0];
				that.current.index = 0;
				that.saveCurrent();
			}
		},
		methods: {
			getVideoList() {
				let that = this;
				uni.request({
					url: this.current.api + "/",
					header: {
						'X-Requested-With': 'XMLHttpRequest',
					},
					success: (res) => {
						console.log(res);
						that.videoList = res.data.fileList;
					}
				});
			},
			refresh() {
				this.getVideoList();
			},
			playTimeupdate(event) {
				let that = this;
				that.current.currentTime = event.detail.currentTime;
				that.saveCurrent();
			},
			playEnded() {
				let that = this;
				that.current.index = that.current.index + 1;
				that.current.src = that.fileList[that.current.index].url2;
				that.saveCurrent();
			},
			serverInput(event) {
				let that = this;
				that.current.server = event.target.value;
				that.saveCurrent();
			},
			apiInput(event) {
				let that = this;
				that.current.api = event.target.value;
				that.saveCurrent();
			},
			selectVideo(item, index) {
				let that = this;
				uni.request({
					url: this.current.api + "/list/" + item.name,
					header: {
						'X-Requested-With': 'XMLHttpRequest',
					},
					success: (res) => {
						console.log(res);
						that.fileList = res.data.fileList;
					}
				})
			},
			onProgressChange(event) {
				// console.log(event);
			},
			parseSeconds(seconds) {
				let hours = 0;
				let minutes = 0;
				if (seconds >= 3600) {
					hours = parseInt(seconds / 3600);
					seconds = seconds % 3600;
				}
				if (seconds >= 60) {
					minutes = parseInt(seconds / 60);
					seconds = seconds % 60;
				}
				let str = minutes + ":" + parseInt(seconds);
				if (hours > 0) {
					str = hours + ":" + str;
				} else {
					str = str.trimLeft('0').trimLeft(':');
				}
				return str;
			},
			onProgressTouchEnd(event) {
				let that = this;
				console.log('onProgressTouchEnd', event.changedTouches[0].clientX);
				let x = event.changedTouches[0].clientX;
				// 先暂定，再设置跳转，再重新播放
				that.innerAudioContext.pause();
				let seek = x / that.processWidth * that.innerAudioContext.duration;
				console.log('x', x, 'processWidth', that.processWidth, 'duration', that.innerAudioContext.duration, 'seek',
					seek);
				that.innerAudioContext.seek(seek);
				that.innerAudioContext.play();
			},
			play() {
				if (this.current.state == 'play') {
					this.current.state = 'pause';
					this.innerAudioContext.pause();
				} else {
					this.current.state = 'play';
					this.innerAudioContext.play();
				}
				this.saveCurrent();
			},
			playVideo(item, index) {
				let that = this;
				that.current.file = item.url2;

				console.log(item.url2);

				that.saveCurrent();
			},
			setPlayMode(mode) {
				this.current.playMode = mode;
				this.saveCurrent();
			},
			saveCurrent() {
				// console.log("saveCurrent");
				uni.setStorageSync('video.current', this.current);
			}
		},
	}
</script>

<style lang="scss">
	.content {
		width: 750rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.video-box {
			video {
				width: 750rpx;
			}
		}

		.list-box {
			height: 100%;
			width: 750rpx;
			padding-left: 40rpx;
			padding-right: 40rpx;

			.video-list {
				flex: 1;
			}

			.file-list {
				flex: 3;
			}
		}

		.video-list,
		.file-list {
			// width: 750rpx;
			// padding-left: 40rpx;
			// padding-right: 40rpx;

			.item {
				text-align: left;
				height: 80rpx;
				line-height: 80rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 1;
				-webkit-box-orient: vertical;
			}

			.active {
				font-weight: bold;
			}
		}

		.process-box {
			padding: 0rpx 40rpx;

			.process {
				width: 580rpx;
			}

			.duration {
				width: 50rpx;
			}

			.slider-container {
				display: flex;
				height: 32rpx;
				position: relative;

				&::before {
					content: '';
					position: absolute;
					height: 8rpx;
					border-radius: 8rpx;
					background-color: #EEEEEE;
					top: 50%;
					left: 0;
					transform: translateY(-50%);
					width: 100%;
				}

				.flex {
					flex: 1;
					height: 8rpx;
					border-radius: 8rpx 0 0 8rpx;
					background-color: $uni-color-primary;
					margin-top: 12rpx;
					position: relative;
					z-index: 1;
				}

				.sliderBar {
					height: 100%;
					border-radius: 8rpx;

					.gone {
						background-color: $uni-color-primary;
						height: 100%;
						position: absolute;
						left: 0;
						height: 8rpx;
						top: 12rpx;
						max-width: 100%;
						z-index: 1;
						border-radius: 0 8rpx 8rpx 0;
					}

					.slider {
						width: 0;
						height: 100%;
						position: relative;
						z-index: 2;

						&::after {
							content: '';
							position: absolute;
							border-radius: 16rpx;
							background-color: $uni-color-primary;
							width: 32rpx;
							height: 100%;
							transform: translatex(-50%);
						}

						text {
							position: absolute;
							width: 80rpx;
							color: white;
							border-radius: 14rpx;
							top: -140%;
							left: 50%;
							text-align: center;
							transform: translateX(-50%);
							background-color: $uni-color-primary;

							&::after {
								content: '';
								position: absolute;
								border: 6rpx solid transparent;
								border-top-color: $uni-color-primary;
								top: 99%;
								left: 50%;
								transform: translateX(-50%);
							}
						}
					}
				}
			}
		}
	}
</style>