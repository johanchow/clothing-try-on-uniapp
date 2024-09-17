<template>
  <view class="container">
    <view class="section profile">
      <image class="avatar" :src="userInfo.avatarUrl"/>
      <text class="nickname">{{ userInfo.nickName }}</text>
    </view>
    <view class="section balance">
      <text class="title">余额</text>
      <text class="amount">{{ balance }}</text>
    </view>
    <view class="section recharge" @tap="handleRecharge">
      <button type="primary">提交</button>
    </view>
  </view>
</template>

<script lang="ts">
import { inject, ref } from 'vue'
import type { Ref } from 'vue'

import { UserInfo } from '@/typing.ts';
export default {
  setup() {
    const userInfo = inject<Ref<UserInfo>>('userInfo')!;
    console.log('profile userInfo.value: ', userInfo.value);
    const balance = ref(1000);

    const handleRecharge = () => {
      uni.showModal({
        title: '充值',
        content: '确认充值100元？',
        success: function (res) {
          if (res.confirm) {
            balance.value += 100;
            uni.showToast({
              title: '充值成功',
              icon: 'success',
              duration: 2000
            });
          }
        }
      });
    };

    return {
      userInfo,
      balance,
      handleRecharge
    };
  }
}
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;

  .section {
    margin-bottom: 30rpx;
    &.profile {
      display: flex;
      align-items: center;
      .avatar {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50rpx;
      }

      .nickname {
        margin-left: 10px;
      }
    }
    &.balance {
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      align-self: center;
      .amount {
        font-size: 80rpx;
        font-weight: bold;
      }
    }
    &.recharge {
      margin-top: 75rpx;
      background-color: #1AAD19;
      color: #ffffff;
      border-radius: 4rpx;
      width: 100%;
      text-align: center;
    }
  }
}
</style>
