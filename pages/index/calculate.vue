<template>
	<view class="content">
		<view class="tab-list flex-row">
			<text class="item" :class="currentTab == 1 ? 'active' : ''" @tap="switchTab(1)">等额本息</text>
			<text class="item" :class="currentTab == 2 ? 'active' : ''" @tap="switchTab(2)">等额本金</text>
		</view>
		<view class="flex-column" v-if="currentTab == 1">
			<view class="flex-row">
				<view class="left">贷款总额</view>
				<view class="right">
					<input />
				</view>
			</view>
			<view class="flex-row">
				<view class="left">按揭年数</view>
				<view class="right">
					<input />
				</view>
			</view>
			<view class="flex-row">
				<view class="left">年利率</view>
				<view class="right">
					<input />
				</view>
			</view>
		</view>
		<view class="flex-column" v-if="currentTab == 2">
			<view class="flex-row">
				<view class="left">贷款总额</view>
				<view class="right">
					<input v-model="providentFund.amount" />
				</view>
			</view>
			<view class="flex-row">
				<view class="left">按揭年数</view>
				<view class="right">
					<input v-model="providentFund.years" />
				</view>
			</view>
			<view class="flex-row">
				<view class="left">年利率</view>
				<view class="right">
					<input v-model="providentFund.interestRate" />
				</view>
			</view>
		</view>
		<view>
			<button @tap="startCalculate">返回</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentTab: 1,
				providentFund: {
					amount: 0,
					interestRate: 0,
					years: 0,
				}
			}
		},
		onLoad() {

		},
		methods: {
			switchTab(tab) {
				this.currentTab = tab;
			},
			navigateTo(path, params = null) {
				uni.setStorageSync('queryString', params);
				uni.navigateTo({
					url: path
				});
			},
			startCalculate(){
				let params = this.currentTab == 2 ? this.providentFund : {};
			}
		}
	}
</script>

<style lang="scss">
	.content {
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
	}
</style>