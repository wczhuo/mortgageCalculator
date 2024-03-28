<template>
	<view class="content flex-column">
		<view class="tab-list flex-row mt-40">
			<text class="item" :class="currentTab == 1 ? 'active' : ''" @tap="switchTab(1)">计算利息</text>
			<text class="item" :class="currentTab == 2 ? 'active' : ''" @tap="switchTab(2)">计算本金</text>
		</view>
		<view class="flex-column gjj-list" v-if="currentTab == 1">
			<view class="flex-row item">
				<view class="left">本金</view>
				<view class="right flex-row">
					<input v-model="benjinToLixi.amount" />
					<text>&nbsp;(万)</text>
				</view>
			</view>
			<view class="flex-row item">
				<view class="left">年利率</view>
				<view class="right flex-row">
					<input v-model="benjinToLixi.interestRate" />
					<text>&nbsp;(%)</text>
				</view>
			</view>
		</view>
		<view class="flex-column sd-list" v-if="currentTab == 2">
			<view class="flex-row item">
				<view class="left">月利息</view>
				<view class="right flex-row">
					<input v-model="lixiToBenjin.interestMonthly" />
					<text>&nbsp;(元)</text>
				</view>
			</view>
			<view class="flex-row item">
				<view class="left">年利率</view>
				<view class="right flex-row">
					<input v-model="lixiToBenjin.interestRate" />
					<text>&nbsp;(%)</text>
				</view>
			</view>
		</view>
		<view class="start mt-20">
			<button @tap="startCalculate">开始计算</button>
		</view>
		<view class="flex-column mt-40">
			<view class="flex-row result-head force-center mb-20">
				<view class="item">本金</view>
				<view class="item">年利率</view>
				<view class="item">利息(年)</view>
				<view class="item">利息(月)</view>
				<view class="item">利息(日)</view>
			</view>
			<view class="result-list">
				<view v-for="(item,index) in resultList" class="row flex-row">
					<view class="item">{{item.amount}}万</view>
					<view class="item">{{item.interestRate}}%</view>
					<view class="item">{{item.interestYearly}}</view>
					<view class="item">{{item.interestMonthly}}</view>
					<view class="item">{{item.interestDaily}}</view>
				</view>
			</view>
		</view>
	</view>
	<view class="fill-box-60"></view>
</template>

<script>
	import {
		navigateTo
	} from '@/static/js/common';
	export default {
		data() {
			return {
				currentTab: 1,
				resultTab: 1,
				benjinToLixi: {
					amount: 30,
					interestRate: 2.0,
					interestMonthly: 0,
					interestYearly: 0,
					interestDaily: 0,
				},
				lixiToBenjin: {
					interestMonthly: 500,
					interestYearly: 0,
					interestDaily: 0,
					interestRate: 2.0,
					amount: 0,
				},
				benxiList: null,
				benjinList: null,
				resultList: [],
			}
		},
		onLoad() {
			// 加载上次的保存的配置
			if (uni.getStorageSync('benjinToLixi')) {
				this.benjinToLixi = uni.getStorageSync('benjinToLixi');
			}
			if (uni.getStorageSync('lixiToBenjin')) {
				this.lixiToBenjin = uni.getStorageSync('lixiToBenjin');
			}
		},
		methods: {
			switchTab(tab) {
				this.currentTab = tab;
			},
			startCalculate() {
				let params = this.currentTab == 1 ? this.benjinToLixi : this.lixiToBenjin;
				params.tab = this.currentTab;
				switch (this.currentTab) {
					case 1:
						this.calculateLixi(params);
						break;
					case 2:
						this.calculateBenjin(params);
						break;
					case 3:
				}
				// 保存数据到本地
				uni.setStorageSync('benjinToLixi', this.benjinToLixi);
				uni.setStorageSync('lixiToBenjin', this.lixiToBenjin);
			},
			calculateLixi(params = null) {
				console.log(123123);
				console.log(this.benjinToLixi.amount, this.benjinToLixi.interestRate, this.benjinToLixi.amount * 10000 *
					parseFloat(this.benjinToLixi
						.interestRate));
				this.benjinToLixi.interestYearly = (this.benjinToLixi.amount * 10000 * parseFloat(this.benjinToLixi
					.interestRate) / 100).toFixed(2);
				this.benjinToLixi.interestMonthly = (this.benjinToLixi.interestYearly / 12).toFixed(2);
				this.benjinToLixi.interestDaily = (this.benjinToLixi.interestYearly / 365).toFixed(2);

				this.resultList = [this.benjinToLixi];
				console.log(this.resultList);
			},
			calculateBenjin(params = null) {
				console.log(456456);
				this.lixiToBenjin.amount = (this.lixiToBenjin.interestMonthly * 12 / (this.lixiToBenjin.interestRate /
					100) / 10000).toFixed(0);
				this.lixiToBenjin.interestYearly = (this.lixiToBenjin.interestMonthly * 12).toFixed(2);
				this.lixiToBenjin.interestDaily = (this.lixiToBenjin.interestYearly / 365).toFixed(2);

				this.resultList = [this.lixiToBenjin];
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

		.tab-list {
			align-items: center;
			justify-content: center;
			text-align: center;

			.item {
				width: 200rpx;
			}

			.active {
				font-weight: bold;
			}
		}

		.result-head {
			width: 750rpx;
			text-align: center;

			.item {
				width: 750rpx;
				width: 150rpx;
				font-size: 30rpx;
			}

			// .item:first-child {
			// 	width: 100rpx;
			// }

			// .item:last-child {
			// 	width: 230rpx;
			// }
		}

		.result-list {
			width: 750rpx;

			.row {
				width: 750rpx;
				text-align: center;
				height: 70rpx;
				line-height: 70rpx;
				border-bottom: 1rpx solid #ccc;

				.item {
					width: 150rpx;
					font-size: 30rpx;
				}

				// .item:first-child {
				// 	width: 100rpx;
				// }

				// .item:last-child {
				// 	width: 230rpx;
				// }
			}
		}

		.gjj-list,
		.sd-list,
		.zhd-list {
			width: 600rpx;
			margin-top: 20rpx;

			.item {
				height: 80rpx;
				line-height: 80rpx;

				.left {
					flex: 1;
				}

				.right {
					flex: 1;
				}

				input {
					height: 80rpx;
					line-height: 80rpx;
					text-align: right;
				}
			}
		}

		.result-tab-list {
			margin-top: 40rpx;
			align-items: center;
			justify-content: center;
			text-align: center;

			.item {
				width: 200rpx;
			}

			.active {
				font-weight: bold;
			}
		}
	}
</style>