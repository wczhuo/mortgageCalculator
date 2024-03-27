// 导航
export function navigateTo(path, params = null) {
	uni.setStorageSync('queryString', params);
	uni.navigateTo({
		url: path
	});
}

// 回退
export function navigateBack(that, path, parmas) {
	let pages = getCurrentPages();
	let prevPath = '';
	if (pages.length >= 1) {
		prevPath = pages[pages.length - 1];
	}
	if (prevPath != '') {
		if (['/pages/index/category', '/pages/index/user', '/pages/index/index', '/pages/index/cart'].indexOf(
				prevPath) >= 0) {
			uni.switchTab({
				url: prevPath
			})
		} else {
			uni.navigateBack({
				delta: 1
			});
		}
	}
}