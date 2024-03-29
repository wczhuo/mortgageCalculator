<template>
	<view class="content flex-column">
		<view class="action-list flex-row mt-40">
			<view class="item" :class="current.playMode=='asc'?'active':''" @tap="setPlayMode('asc')">顺序播放</view>
			<view class="item" :class="current.playMode=='single'?'active':''" @tap="setPlayMode('single')">单曲循环</view>
			<view class="item" :class="current.playMode=='random'?'active':''" @tap="setPlayMode('random')">随机播放</view>
			<view class="item" :class="current.playMode=='desc'?'active':''" @tap="setPlayMode('desc')">倒序播放</view>
			<view class="item" :class="current.state=='play'?'active':''" @tap="play">播放/暂停</view>
		</view>
		<view class="process-box flex-row">
			<view class="slider-container" :style="'width:'+(process.slideBarWidth)+'rpx'">
				<movable-area class="sliderBar" :style="'width:'+process.slideBarWidth+'rpx;'">
					<!-- 蓝色背景条 -->
					<view class="gone" :style="{width: process.x +'rpx'}"></view>

					<movable-view class="slider" direction="horizontal" :x="process.x * systemInfo.windowWidth / 750"
						@change="onProgressChange" @touchend="onProgressTouchEnd">
						<text>{{ process.score }}</text>
					</movable-view>
				</movable-area>

				<!-- 灰色背景条 -->
				<view :style="{width: (process.minScore / process.maxScore) * 100 +'%'}"></view>
			</view>
		</view>
		<view class="music-list flex-column" v-for="(item,index) in musicList">
			<view class="item" :class="current.file == item ? 'active' : ''" @tap="playMusic(item, index)">{{item}}
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
					duration: 0,
					currentTime: 0,
					seek: 0,
					state: 'play', // pause
					file: '',
					index: 0,
					mode: 'asc',
					playMode: 'asc', // random asc desc single
				},
				musicList: [],
				folder: "/storage/emulated/0/Music/合集一",
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

			that.processWidth = that.systemInfo.screenWidth * 670 / 750;
			console.log('processWidth', that.processWidth);

			if (uni.getStorageSync('music.current')) {
				let current = uni.getStorageSync('music.current');
				for (var i in current) {
					that.current[i] = current[i];
				}
			}
			console.log('current ', JSON.stringify(uni.getStorageSync('music.current')));
			console.log('current ', JSON.stringify(that.current));

			// #ifdef APP-PLUS
			plus.io.resolveLocalFileSystemURL(
				that.folder, //指定的目录
				function(entry) {
					var directoryReader = entry.createReader(); //获取读取目录对象
					directoryReader.readEntries(
						function(entries) { //历遍子目录即可
							for (var i = 0; i < entries.length; i++) {
								// console.log("文件信息：" + entries[i].name);
								that.musicList.push(entries[i].name);

								if (!that.current.file) {
									that.current.file = that.musicList[0];
									that.current.index = 0;
									that.saveCurrent();
								}
							}
						},
						function(err) {
							console.log("访问目录失败");
						});
				},
				function(err) {
					console.log("访问指定目录失败:" + err.message);
				});
			// #endif


			if (!that.current.file) {
				that.current.file = that.musicList[0];
				that.saveCurrent();
			}

			that.innerAudioContext.autoplay = true;
			that.innerAudioContext.src = "file://" + that.folder + "/" + that.current.file;
			that.current.duration = that.innerAudioContext.duration;
			if (that.current.currentTime > 0) {
				console.log("currentTime ", that.current.currentTime);
				// 单位为秒，必须是整数
				setTimeout(function() {
					// console.log("currentTime set");
					// that.innerAudioContext.pause();
					// that.innerAudioContext.seek(parseInt(that.current.currentTime));
					// that.innerAudioContext.play();
				}, 1000);
			}
			// that.innerAudioContext.play();

			that.innerAudioContext.onPlay(() => {
				console.log('开始播放');
				if (that.setSeek) {
					that.innerAudioContext.seek(parseInt(that.current.currentTime));
					that.setSeek = false;
				}
				that.current.duration = that.innerAudioContext.duration;
			});
			that.innerAudioContext.onError((res) => {
				console.log(res.errMsg);
				console.log(res.errCode);
			});

			that.innerAudioContext.onTimeUpdate((res) => {
				that.current.currentTime = that.innerAudioContext.currentTime;
				that.saveCurrent();
				// 设置进度条
				that.process.x = that.innerAudioContext.currentTime / that.innerAudioContext.duration * that
					.processWidth * (750 / that.systemInfo.windowWidth);
				that.process.score = that.parseSeconds(that.innerAudioContext.currentTime);
				console.log('音频播放进度更新', that.innerAudioContext.currentTime, that.innerAudioContext.duration, 'x',
					that.process.x);
			});

			that.innerAudioContext.onEnded(() => {
				console.log('播放结束，下一首');
				if (that.current.playMode == 'asc') {
					// 正序播放
					if (that.current.index < (that.musicList.length - 1)) {
						that.current.index = that.current.index + 1;
					} else {
						that.current.index = 0;
					}
					that.current.file = that.musicList[that.current.index];
					// that.playMusic(that.current.file, that.current.index);
				} else if (that.current.playMode == 'desc') {
					// 倒序播放
					if (that.current.index > 0) {
						that.current.index = that.current.index - 1;
					} else {
						that.current.index = that.musicList.length - 1;
					}
					that.current.file = that.musicList[that.current.index];
					// that.playMusic(that.current.file, that.current.index);
				} else if (that.current.playMode == 'single') {
					// 单曲循环
					// that.playMusic(that.current.file, that.current.index);
				} else if (that.current.playMode == 'random') {
					// 随机播放
					that.current.index = Math.floor(Math.random() * that.musicList.length);
					console.log(that.current.index);
					that.current.file = that.musicList[that.current.index];
				}
				console.log(that.current.playMode, that.current.file, that.current.index);
				that.playMusic(that.current.file, that.current.index);
			});

			if (that.innerAudioContext) {
				try {
					// console.log("pause destroy");
					// innerAudioContext.play();
					// innerAudioContext.pause();
					// innerAudioContext.destroy()
					// that.innerAudioContext = null
				} catch (e) {
					//TODO handle the exception
				}
			}
		},
		methods: {
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
			playMusic(file, index) {
				let that = this;
				that.current.file = file;
				that.current.index = index;
				that.innerAudioContext.src = "file://" + that.folder + "/" + file;
				that.innerAudioContext.play();

				that.saveCurrent();
			},
			setPlayMode(mode) {
				this.current.playMode = mode;
				this.saveCurrent();
			},
			saveCurrent() {
				// console.log("saveCurrent");
				uni.setStorageSync('music.current', this.current);
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

		.action-list {
			width: 750rpx;
			height: 80rpx;
			line-height: 80rpx;

			.item {
				// width: 250rpx;
				text-align: center;
				flex: 1;
			}

			.active {
				font-weight: bold;
			}
		}

		.music-list {
			width: 750rpx;
			padding-left: 40rpx;
			padding-right: 40rpx;

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