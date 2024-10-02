<template>
  <view>
    <!-- 检查是否已授权 -->
    <view v-if="!hasAuth">
      <button type="primary" @tap="getUserProfile">授权微信信息</button>
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
  } catch (error) {
    console.error('获取微信用户信息失败:', error);
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
    return;
  }
  console.log('获取identity成功:', openIdRes.data);
  return openIdRes.data;
};
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
