<template>
	<view class="content flex-column">
		<view class="tab-list flex-row mt-40">
			<text class="item" :class="currentTab == 1 ? 'active' : ''" @tap="switchTab(1)">公积金贷款</text>
			<text class="item" :class="currentTab == 2 ? 'active' : ''" @tap="switchTab(2)">商业贷款</text>
			<text class="item" :class="currentTab == 3 ? 'active' : ''" @tap="switchTab(3)">组合贷款</text>
		</view>
		<view class="flex-column gjj-list" v-if="currentTab == 1">
			<view class="flex-row item">
				<view class="left">贷款总额</view>
				<view class="right flex-row">
					<input v-model="providentFund.amount" />
					<text>&nbsp;(万)</text>
				</view>
			</view>
			<view class="flex-row item">
				<view class="left">按揭年数</view>
				<view class="right flex-row">
					<input v-model="providentFund.years" />
					<text>&nbsp;(年)</text>
				</view>
			</view>
			<view class="flex-row item">
				<view class="left">年利率</view>
				<view class="right flex-row">
					<input v-model="providentFund.interestRate" />
					<text>&nbsp;(%)</text>
				</view>
			</view>
		</view>
		<view class="flex-column sd-list" v-if="currentTab == 2">
			<view class="flex-row item">
				<view class="left">贷款总额</view>
				<view class="right flex-row">
					<input v-model="commercialLoans.amount" />
					<text>&nbsp;(万)</text>
				</view>
			</view>
			<view class="flex-row item">
				<view class="left">按揭年数</view>
				<view class="right flex-row">
					<input v-model="commercialLoans.years" />
					<text>&nbsp;(年)</text>
				</view>
			</view>
			<view class="flex-row item">
				<view class="left">年利率</view>
				<view class="right flex-row">
					<input v-model="commercialLoans.interestRate" />
					<text>&nbsp;(%)</text>
				</view>
			</view>
		</view>
		<view class="flex-column zhd-list" v-if="currentTab == 3">
			<view class="flex-row item">
				<view class="left">公积金贷款总额</view>
				<view class="right flex-row">
					<input v-model="providentFund.amount" />
					<text>&nbsp;(万)</text>
				</view>
			</view>
			<view class="flex-row item">
				<view class="left">公积金按揭年数</view>
				<view class="right flex-row">
					<input v-model="providentFund.years" />
					<text>&nbsp;(年)</text>
				</view>
			</view>
			<view class="flex-row item">
				<view class="left">公积金年利率</view>
				<view class="right flex-row">
					<input v-model="providentFund.interestRate" />
					<text>&nbsp;(%)</text>
				</view>
			</view>
			<view class="flex-row item">
				<view class="left">商业贷款总额</view>
				<view class="right flex-row">
					<input v-model="commercialLoans.amount" />
					<text>&nbsp;(万)</text>
				</view>
			</view>
			<view class="flex-row item">
				<view class="left">商贷按揭年数</view>
				<view class="right flex-row">
					<input v-model="commercialLoans.years" />
					<text>&nbsp;(年)</text>
				</view>
			</view>
			<view class="flex-row item">
				<view class="left">商贷年利率</view>
				<view class="right flex-row">
					<input v-model="commercialLoans.interestRate" />
					<text>&nbsp;(%)</text>
				</view>
			</view>
		</view>
		<view class="start mt-20">
			<button @tap="startCalculate">开始计算</button>
		</view>
		<view class="result-tab-list flex-row">
			<text class="item" :class="resultTab == 1 ? 'active' : ''" @tap="switchResultTab(1)">等额本息</text>
			<text class="item" :class="resultTab == 2 ? 'active' : ''" @tap="switchResultTab(2)">等额本金</text>
		</view>
		<view class="flex-column mt-40">
			<view class="flex-row result-head force-center mb-20">
				<view class="item">期数</view>
				<view class="item">月供总额</view>
				<view class="item">月供本金</view>
				<view class="item">月供利息</view>
				<view class="item">剩余还款总额</view>
			</view>
			<view class="result-list">
				<view v-for="(item,index) in resultList" class="row flex-row">
					<view class="item">{{index + 1}}</view>
					<view class="item">{{item.yuegong}}</view>
					<view class="item">{{item.yuebenjin}}</view>
					<view class="item">{{item.yuelixi}}</view>
					<view class="item">{{item.leftFund}}</view>
				</view>
			</view>
		</view>
	</view>
	<view class="fill-box-60"></view>
</template>

<script>
	export default {
		data() {
			return {
				currentTab: 1,
				resultTab: 1,
				providentFund: {
					amount: 51,
					interestRate: 3.1,
					years: 29,
				},
				commercialLoans: {
					amount: 21,
					interestRate: 3.95,
					years: 29,
				},
				benxiList: null,
				benjinList: null,
				resultList: [],
			}
		},
		onLoad() {
			// 加载上次的保存的配置
			if (uni.getStorageSync('providentFund')) {
				this.providentFund = uni.getStorageSync('providentFund');
			}
			if (uni.getStorageSync('commercialLoans')) {
				this.commercialLoans = uni.getStorageSync('commercialLoans');
			}
		},
		methods: {
			switchTab(tab) {
				this.currentTab = tab;
			},
			switchResultTab(tab) {
				this.resultTab = tab;
				// console.log(this.benxiList);
				// console.log(this.benjinList);
				if (this.resultTab == 1) {
					this.resultList = this.benxiList.mouthdataArray;
				} else {
					this.resultList = this.benjinList.mouthdataArray;
				}
				console.log(this.resultList);
				this.$forceUpdate();
			},
			navigateTo(path, params = null) {
				console.log(path, params);
				uni.setStorageSync('queryString', params);
				uni.navigateTo({
					url: path
				});
			},
			startCalculate() {
				let params = this.currentTab == 1 ? this.providentFund : this.commercialLoans;
				if (this.currentTab == 3) {
					params = this.providentFund;
				}
				params.tab = this.currentTab;
				switch (this.currentTab) {
					case 1:
						this.calculateProvidentFund(params);
						break;
					case 2:
						this.calculateCommercialLoans(params);
						break;
					case 3:
						this.calculatePortfolioLoan(this.providentFund, this.commercialLoans);
						break;
				}
				// this.navigateTo('/pages/index/calculate', params);
				// 保存数据到本地
				uni.setStorageSync('providentFund', this.providentFund);
				uni.setStorageSync('commercialLoans', this.commercialLoans);
			},
			calculatePortfolioLoan(paramsCommercialLoans, paramsProvidentFund) {
				let benxiList1 = this.benxi(1, paramsCommercialLoans.amount, paramsCommercialLoans.years,
					paramsCommercialLoans.interestRate);
				let benjinList1 = this.benjin(1, paramsCommercialLoans.amount, paramsCommercialLoans.years,
					paramsCommercialLoans.interestRate);
				let benxiList2 = this.benxi(1, paramsProvidentFund.amount, paramsProvidentFund.years, paramsProvidentFund
					.interestRate);
				let benjinList2 = this.benjin(1, paramsProvidentFund.amount, paramsProvidentFund.years, paramsProvidentFund
					.interestRate);
				// 合并
				let years = Math.max(paramsCommercialLoans.years, paramsProvidentFund.years);
				let benxiList = {
					mouthdataArray: []
				};
				for (let i = 0; i < years * 12; i++) {
					benxiList.mouthdataArray[i] = {};
					benxiList.mouthdataArray[i].yuegong = parseFloat(benxiList1.mouthdataArray[i].yuegong) + parseFloat(
						benxiList2.mouthdataArray[i].yuegong);
					benxiList.mouthdataArray[i].yuelixi = parseFloat(benxiList1.mouthdataArray[i].yuelixi) + parseFloat(
						benxiList2.mouthdataArray[i].yuelixi);
					benxiList.mouthdataArray[i].yuebenjin = parseFloat(benxiList1.mouthdataArray[i].yuebenjin) +
						parseFloat(benxiList2.mouthdataArray[i].yuebenjin);
					benxiList.mouthdataArray[i].leftFund = parseFloat(benxiList1.mouthdataArray[i].leftFund) + parseFloat(
						benxiList2.mouthdataArray[i].leftFund);
					benxiList.mouthdataArray[i].yuegong = benxiList.mouthdataArray[i].yuegong.toFixed(2);
					benxiList.mouthdataArray[i].yuelixi = benxiList.mouthdataArray[i].yuelixi.toFixed(2);
					benxiList.mouthdataArray[i].yuebenjin = benxiList.mouthdataArray[i].yuebenjin.toFixed(2);
					benxiList.mouthdataArray[i].leftFund = benxiList.mouthdataArray[i].leftFund.toFixed(2);
				}
				let benjinList = {
					mouthdataArray: []
				};
				for (let i = 0; i < years * 12; i++) {
					benjinList.mouthdataArray[i] = {};
					benjinList.mouthdataArray[i].yuegong = parseFloat(benjinList1.mouthdataArray[i].yuegong) + parseFloat(
						benjinList2.mouthdataArray[i].yuegong);
					benjinList.mouthdataArray[i].yuelixi = parseFloat(benjinList1.mouthdataArray[i].yuelixi) + parseFloat(
						benjinList2.mouthdataArray[i].yuelixi);
					benjinList.mouthdataArray[i].yuebenjin = parseFloat(benjinList1.mouthdataArray[i].yuebenjin) +
						parseFloat(benjinList2.mouthdataArray[i].yuebenjin);
					benjinList.mouthdataArray[i].leftFund = parseFloat(benjinList1.mouthdataArray[i].leftFund) +
						parseFloat(benjinList2.mouthdataArray[i].leftFund);
					benjinList.mouthdataArray[i].yuegong = benjinList.mouthdataArray[i].yuegong.toFixed(2);
					benjinList.mouthdataArray[i].yuelixi = benjinList.mouthdataArray[i].yuelixi.toFixed(2);
					benjinList.mouthdataArray[i].yuebenjin = benjinList.mouthdataArray[i].yuebenjin.toFixed(2);
					benjinList.mouthdataArray[i].leftFund = benjinList.mouthdataArray[i].leftFund.toFixed(2);
				}

				this.benjinList = benjinList;
				this.benxiList = benxiList;
				this.resultList = this.benxiList.mouthdataArray;
				console.log(this.resultList);
			},
			calculateCommercialLoans(params = null) {
				this.benxiList = this.benxi(1, params.amount, params.years, params.interestRate);
				this.benjinList = this.benjin(1, params.amount, params.years, params.interestRate);
				this.resultList = this.benxiList.mouthdataArray;
				console.log(this.benxiList);
				console.log(this.benjinList);
			},
			calculateProvidentFund(params = null) {
				console.log(params);
				this.benxiList = this.benxi(1, params.amount, params.years, params.interestRate);
				this.benjinList = this.benjin(1, params.amount, params.years, params.interestRate);
				this.resultList = this.benxiList.mouthdataArray;
				console.log(this.benxiList);
				console.log(this.benjinList);
			},
			benjin(type, num, year, lilv) {
				//等额本金计算
				var mouth = parseInt(year) * 12,
					mouthlilv = parseFloat(lilv) / 12 / 100,
					dknum = parseFloat(num) * 10000,
					yhbenjin = 0; //首月还款已还本金金额是0
				//每月应还本金=贷款本金÷还款月数
				var everymonthyh = dknum / mouth
				//每月月供额=(贷款本金÷还款月数)+(贷款本金-已归还本金累计额)×月利率
				var yuegong = everymonthyh + (dknum - yhbenjin) * mouthlilv;
				//每月月供递减额=每月应还本金×月利率=贷款本金÷还款月数×月利率
				var yuegongdijian = everymonthyh * mouthlilv;
				//总利息=〔(总贷款额÷还款月数+总贷款额×月利率)+总贷款额÷还款月数×(1+月利率)〕÷2×还款月数-总贷款额
				var totalLixi = ((everymonthyh + dknum * mouthlilv) + dknum / mouth * (1 + mouthlilv)) / 2 *
					mouth - dknum;
				//还款总额 总利息+贷款本金
				var totalPrice = totalLixi + dknum,
					leftFund = totalLixi + dknum;

				//循环月份
				var mouthdataArray = [],
					nowmouth = new Date().getMonth(),
					realmonth = 0;

				for (var i = 1; i <= mouth; i++) {
					realmonth = nowmouth + i;
					var yearlist = Math.floor(i / 12);

					realmonth = realmonth - 12 * yearlist;

					if (realmonth > 12) {
						realmonth = realmonth - 12
					}
					yhbenjin = everymonthyh * (i - 1);
					var yuebenjin = everymonthyh + (dknum - yhbenjin) * mouthlilv;
					//每月应还利息=剩余本金×月利率=(贷款本金-已归还本金累计额)×月利率
					var yuelixi = (dknum - yhbenjin) * mouthlilv;
					leftFund = leftFund - yuebenjin;
					if (leftFund < 0) {
						leftFund = 0
					}
					mouthdataArray[i - 1] = {
						monthName: realmonth + "月",
						yuegong: (yuelixi + everymonthyh).toFixed(2),
						yuelixi: yuelixi.toFixed(2),
						//每月本金
						yuebenjin: everymonthyh.toFixed(2),
						//剩余还款
						leftFund: leftFund.toFixed(2)
					}
				}
				return {
					totalLixi: totalLixi,
					totalPrice: totalPrice,
					yuegongdijian: yuegongdijian,
					mouthdataArray: mouthdataArray,
					totalDknum: num,
					year: year
				};
			},
			benxi(type, num, year, lilv) {
				//等额本息计算
				//每月月供额=〔贷款本金×月利率×(1＋月利率)＾还款月数〕÷〔(1＋月利率)＾还款月数-1〕
				var mouth = parseInt(year) * 12,
					mouthlilv = parseFloat(lilv) / 12 / 100,
					dknum = parseFloat(num) * 10000;
				//每月月供
				var yuegong = (dknum * mouthlilv * Math.pow((1 + mouthlilv), mouth)) / (Math.pow((1 + mouthlilv), mouth) -
					1);
				//总利息=还款月数×每月月供额-贷款本金
				var totalLixi = mouth * yuegong - dknum;
				//还款总额 总利息+贷款本金
				var totalPrice = totalLixi + dknum,
					leftFund = totalLixi + dknum;

				//循环月份
				var mouthdataArray = [],
					nowmouth = new Date().getMonth(),
					realmonth = 0;

				for (var i = 1; i <= mouth; i++) {
					realmonth = nowmouth + i;
					var yearlist = Math.floor(i / 12);

					realmonth = realmonth - 12 * yearlist;

					if (realmonth > 12) {
						realmonth = realmonth - 12
					}
					//console.log(realmonth)
					//每月应还利息=贷款本金×月利率×〔(1+月利率)^还款月数-(1+月利率)^(还款月序号-1)〕÷〔(1+月利率)^还款月数-1〕
					var yuelixi = dknum * mouthlilv * (Math.pow((1 + mouthlilv), mouth) - Math.pow((1 + mouthlilv), i -
						1)) / (Math.pow((1 + mouthlilv), mouth) - 1);
					//每月应还本金=贷款本金×月利率×(1+月利率)^(还款月序号-1)÷〔(1+月利率)^还款月数-1〕
					var yuebenjin = dknum * mouthlilv * Math.pow((1 + mouthlilv), i - 1) / (Math.pow((1 + mouthlilv),
						mouth) - 1);
					leftFund = leftFund - (yuelixi + yuebenjin);
					if (leftFund < 0) {
						leftFund = 0
					}
					mouthdataArray[i - 1] = {
						yuegong: yuegong.toFixed(2),
						monthName: realmonth + "月",
						yuelixi: yuelixi.toFixed(2),
						yuebenjin: yuebenjin.toFixed(2),
						//剩余还款
						leftFund: leftFund.toFixed(2)
					}
				}
				return {
					yuegong: yuegong,
					totalLixi: totalLixi,
					totalPrice: totalPrice,
					mouthdataArray: mouthdataArray,
					totalDknum: num,
					year: year
				};
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
				width: 140rpx;
				font-size: 30rpx;
			}

			.item:first-child {
				width: 100rpx;
			}

			.item:last-child {
				width: 230rpx;
			}
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
					width: 140rpx;
					font-size: 30rpx;
				}

				.item:first-child {
					width: 100rpx;
				}

				.item:last-child {
					width: 230rpx;
				}
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