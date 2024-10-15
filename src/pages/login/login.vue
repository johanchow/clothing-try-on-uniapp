<template>
  <view>
    <!-- 检查是否已授权 -->
    <view class="auth-container" v-if="!hasAuth">
      <view class="corporation">
        <image src="//wx.qlogo.cn/mmhead/ZqDaDiccbgkgIR2dMSQdSic91KghfoLMkk8geIoibR8N7zAzrke9EEkvyOqs078oneoNUu8knzwVHI/0" mode="widthFix" class="logo"/>
        <text class="title">空中air试衣</text>
      </view>
      <view class="auth-tip">使用微信号一键登录(不获取微信信息，仅区分用户)</view>
      <button type="primary" @tap="getUserProfile">授权</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { inject, ref, onBeforeMount } from 'vue'
import type { Ref } from 'vue'
import { ApiHost } from '@/config';
import type { UserInfo } from '@/typing.d.ts';

const hasAuth = ref(false);
const userInfoRef = inject<Ref<UserInfo>>('userInfo')!;

onBeforeMount(() => {
  const userInfo = uni.getStorageSync('userInfo');
  if (userInfo) {
    hasAuth.value = true;
  }
});
const getUserProfile = async () => {
  let userInfo: UserInfo;
  console.log('开始调用uni.getUserProfile');
  try {
    // 使用获取到的code调用getUserProfile获取用户信息
    const { userInfo: info } = await uni.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户信息的目的
      provider: 'weixin'
    });
    console.log('获取到微信用户信息:', info);
    const identity = await getIdentity();
    userInfo = {
      ...info,
      ...identity,
      avatarUrl: info.avatarUrl,
      nickName: info.nickName,
    };
  } catch (error: any) {
    console.error('获取微信用户信息失败:', error);
    uni.showToast({
      title: `微信登录失败: ${error.errno}`,
      icon: 'none',
    });
    return;
  }
  userInfoRef.value = userInfo;
  uni.setStorage({
    key: 'userInfo',
    data: userInfo,
  });
  // 路由返回
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
  } else {
    uni.switchTab({
      url: '/pages/creation/creation'
    });
  }
};

const getIdentity = async () => {
  const res = await uni.login();
  if (!res.code) {
    console.error('登录失败！');
    uni.showToast({
      title: '登录失败，请退出重试',
      icon: 'none',
    })
    return;
  }
  const openIdRes: AnyObject = await uni.request({
    url: `${ApiHost}/weixin-srv/get-openid`,
    method: 'POST',
    data: {
      code: res.code,
    },
  });
  if (!openIdRes.data?.openid) {
    console.error('获取openid失败:', openIdRes.data?.openid);
    uni.showToast({
      title: '获取openid失败',
      icon: 'none',
    });
    return;
  }
  console.log('获取identity成功:', openIdRes.data);
  return openIdRes.data;
};
</script>

<style lang="scss">
.auth-container {
  padding: 25rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 600rpx;
  .corporation {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 24rpx;
    image {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50rpx;
    }
    .title {
      font-size: 36rpx;
      color: #000
    }
  }
  .auth-tip {
    font-size: 24rpx;
    margin-top: 20rpx;
  }
  button {
    width: 600rpx;
    margin-top: 200rpx;
  }
}
</style>
