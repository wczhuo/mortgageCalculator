<template>
	<view class="content flex-column">
		<view class="action-list flex-row mt-40">
			<view class="item" :class="playMode=='asc'?'active':''" @tap="setPlayMode('asc')">顺序播放</view>
			<view class="item" :class="playMode=='single'?'active':''" @tap="setPlayMode('single')">单曲循环</view>
			<view class="item" :class="playMode=='random'?'active':''" @tap="setPlayMode('random')">随机播放</view>
			<view class="item" :class="playMode=='desc'?'active':''" @tap="setPlayMode('desc')">倒序播放</view>
			<view class="item" @tap="play">播放/暂停</view>
		</view>
		<view class="music-list flex-column" v-for="(item,index) in musicList">
			<view class="item" :class="currentFile==item?'active':''" @tap="playMusic(item, index)">{{item}}</view>
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
					poster: 'https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/music-a.png',
					name: '致爱丽丝',
					author: '暂无',
					src: 'https://web-ext-storage.dcloud.net.cn/uni-app/ForElise.mp3',
					// src: '@/static/半壶纱-刘珂矣.flac',
					duration: 0,
					seek: 0,
				},
				audioAction: {
					method: 'pause'
				},
				musicList: [],
				folder: "/storage/emulated/0/Music/合集一",
				currentState: 'play', // pause
				currentFile: '',
				currentFileIndex: 0,
				playMode: 'asc', // random asc desc single
			}
		},
		onLoad() {
			let that = this;

			if (uni.getStorageSync('currentFile')) {
				that.currentFile = uni.getStorageSync('currentFile');
			}
			if (uni.getStorageSync('currentFileIndex')) {
				that.currentFileIndex = uni.getStorageSync('currentFileIndex');
			}
			if (uni.getStorageSync('playMode')) {
				that.playMode = uni.getStorageSync('playMode');
			}

			// #ifdef APP-PLUS
			plus.io.resolveLocalFileSystemURL(
				that.folder, //指定的目录
				function(entry) {
					var directoryReader = entry.createReader(); //获取读取目录对象
					directoryReader.readEntries(
						function(entries) { //历遍子目录即可
							for (var i = 0; i < entries.length; i++) {
								console.log("文件信息：" + entries[i].name);
								that.musicList.push(entries[i].name);

								if (!that.currentFile) {
									that.currentFile = that.musicList[0];
									that.currentFileIndex = 0;
									uni.setStorageSync('currentFile', that.currentFile);
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

			that.innerAudioContext.autoplay = true;

			console.log("currentFile 1", that.currentFile);
			if (!that.currentFile) {
				that.currentFile = that.musicList[0];
				uni.setStorageSync('currentFile', that.currentFile);
			}
			console.log("currentFile 2", that.currentFile);

			that.innerAudioContext.src = "file://" + that.folder + "/" + that.currentFile;
			that.innerAudioContext.onPlay(() => {
				console.log('开始播放');
			});
			that.innerAudioContext.onError((res) => {
				console.log(res.errMsg);
				console.log(res.errCode);
			});

			that.innerAudioContext.onEnded(() => {
				console.log('播放结束，下一首');
				if (that.playMode == 'asc') {
					// 正序播放
					if (that.currentFileIndex < (that.musicList.length - 1)) {
						that.currentFileIndex = that.currentFileIndex + 1;
					} else {
						that.currentFileIndex = 0;
					}
					that.currentFile = that.musicList[that.currentFileIndex];
					that.playMusic(that.currentFile, that.currentFileIndex);
				} else if (that.playMode == 'desc') {
					// 倒序播放
					// 正序播放
					if (that.currentFileIndex > 0) {
						that.currentFileIndex = that.currentFileIndex - 1;
					} else {
						that.currentFileIndex = that.musicList.length - 1;
					}
					that.currentFile = that.musicList[that.currentFileIndex];
					that.playMusic(that.currentFile, that.currentFileIndex);
				} else if (that.playMode == 'single') {
					// 单曲循环
					that.playMusic(that.currentFile, that.currentFileIndex);
				} else if (that.playMode == 'random') {
					// 随机播放
					that.currentFileIndex = Math.floor(Math.random() * 10 * that.musicList.length);
					that.currentFile = that.musicList[that.currentFileIndex];
					that.playMusic(that.currentFile, that.currentFileIndex);
				}
			});

			if (that.innerAudioContext) {
				try {
					console.log("pause destroy");
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
			play() {
				if (this.currentState == 'play') {
					this.currentState = 'pause';
					this.innerAudioContext.pause();
				} else {
					this.currentState = 'play';
					this.innerAudioContext.play();
				}
			},
			playMusic(file, index) {
				let that = this;
				that.currentFile = file;
				that.currentFileIndex = index;
				that.innerAudioContext.src = "file://" + that.folder + "/" + file;
				that.innerAudioContext.play();
				uni.setStorageSync('currentFile', that.currentFile);
				uni.setStorageSync('currentFileIndex', that.currentFileIndex);
			},
			setPlayMode(mode) {
				this.playMode = mode;
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
	}
</style>