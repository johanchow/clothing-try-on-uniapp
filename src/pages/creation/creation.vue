<template>
  <view class="container">
    <!-- 上传图片组件 -->
    <view class="section">
      <text class="label">服装图片</text>
      <view class="upload-btn" @click="chooseAndUpload">
        <text v-if="!imgPath">点击上传图片</text>
        <image class="preview-image" v-else :src="imgPath" mode="aspectFit" />
      </view>
    </view>

    <view class="section">
      <view class="label">AI模特</view>
      <view class="select-group">
        <view>
          <label class="radio-label">性别</label>
          <view>
            <radio-group class="radio-buttons" @change="handleSexChange">
              <label class="radio radio-button" :class="{'checked': selectedSex === 'female'}">
                <radio value="female" />女性
              </label>
              <label class="radio radio-button" :class="{'checked': selectedSex === 'male'}">
                <radio value="male" />男性
              </label>
            </radio-group>
          </view>
        </view>
        <view>
          <label class="radio-label">年龄</label>
          <radio-group @change="handleAgeChange">
            <view class="radio-buttons">
              <label class="radio radio-button" :class="{'checked': selectedAge === 'child'}">
                <radio value="child" />5-18岁
              </label>
              <label class="radio radio-button" :class="{'checked': selectedAge === 'junior'}">
                <radio value="junior" />18-40岁
              </label>
              <label class="radio radio-button" :class="{'checked': selectedAge === 'senior'}">
                <radio value="senior" />40-70岁</label>
            </view>
          </radio-group>
        </view>
        <view>
          <label class="radio-label">视角</label>
          <radio-group @change="handleViewChange">
            <view class="radio-buttons">
              <label class="radio radio-button" :class="{'checked': selectedView === 'full-body'}">
                <radio value="full-body" />全身照
              </label>
              <label class="radio radio-button" :class="{'checked': selectedView === 'upper-body'}">
                <radio value="upper-body" />上身照
              </label>
              <label class="radio radio-button" :class="{'checked': selectedView === 'lower-body'}">
                <radio value="lower-body" />下身照
              </label>
            </view>
          </radio-group>
        </view>
        <view>
          <label class="radio-label">背景</label>
          <radio-group @change="handleStyleChange">
            <view class="radio-buttons">
              <label class="radio radio-button" :class="{'checked': selectedStyle === 'pure'}">
                <radio value="pure" />纯色
              </label>
              <label class="radio radio-button" :class="{'checked': selectedStyle === 'urban'}">
                <radio value="urban" />街景
              </label>
              <label class="radio radio-button" :class="{'checked': selectedStyle === 'scenery'}">
                <radio value="scenery" />自然景
              </label>
            </view>
          </radio-group>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="section submit-section">
      <button type="primary" @click="handleSubmit">提交</button>
    </view>
  </view>
</template>

<script lang="ts">
import { inject, onBeforeMount, ref } from 'vue';
import type { Ref } from 'vue'
import { ApiCreateImageUrl, ApiUploadImageUrl } from '@/config';
import type { UserInfo } from '@/typing.d.ts';

export default {
  setup() {
    // 定义图片列表的状态
    const selectedFileId = ref('');
    const imgPath = ref('');
    const uploadPromise = ref<Promise<number> | undefined>(undefined);

    // 记录用户选择
    const selectedSex = ref<string>('female');
    const selectedAge = ref<string>('junior');
    const selectedView = ref<string>('full-body');
    const selectedStyle = ref<string>('pure');

    const userInfo = inject<Ref<UserInfo>>('userInfo')!;

    const chooseAndUpload = async () => {
      uploadPromise.value = new Promise((resolve) => {
        uni.chooseImage({
          count: 1,
          sourceType: ['album', 'camera'],
          success: function (res) {
            console.log('filePath: ', res.tempFilePaths[0]);
            imgPath.value = res.tempFilePaths[0];
            uni.uploadFile({
              url: ApiUploadImageUrl,
              filePath: res.tempFilePaths[0],
              name: 'clothing_image',
              formData: {
                user_id: userInfo.value.openid,
              },
              success: (res) => {
                if (res.statusCode !== 200) {
                  return;
                }
                selectedFileId.value = JSON.parse(res.data).resource_id;
                console.log('fileId: ', selectedFileId.value);
              }
            });
            resolve(0);
          }
        });
      });
    };

    // 选择器选择回调
    const handleSexChange = (e: any) => {
      selectedSex.value = e.detail.value;
    };
    const handleAgeChange = (e: any) => {
      console.log('e: ', e);
      selectedAge.value = e.detail.value;
    };
    const handleViewChange = (e: any) => {
      console.log('e: ', e);
      selectedView.value = e.detail.value;
    };
    const handleStyleChange = (e: any) => {
      console.log('e: ', e);
      selectedStyle.value = e.detail.value;
    };

    // 提交按钮点击事件
    const handleSubmit = async () => {
      if (!imgPath.value) {
        uni.showToast({
          title: '请上传图片',
          icon: 'none'
        });
        return;
      }
      await uploadPromise.value;
      console.log('开始发送请求，生成AI图片');
      uni.request({
        url: ApiCreateImageUrl,
        method: 'POST',
        data: {
          user_id: userInfo.value.openid,
          real_clothing_id: selectedFileId.value,
          gender: selectedSex.value,
          age: selectedAge.value,
          view: selectedView.value,
          style: selectedStyle.value
        }
      });
      // 模拟提交数据
      uni.showToast({
        title: 'AI生成中，请1分钟后在【历史图】中查看',
        icon: 'success'
      });
    };

    onBeforeMount(() => {
      // 检查登录态
      if (!userInfo.value.openid) {
        console.log('未登录的用户，跳转授权登录');
        uni.reLaunch({
          url: '/pages/login/login'  // 主页面的路径
        });
      }
    });

    // 返回模板中需要的数据和方法
    return {
      chooseAndUpload,
      imgPath,
      selectedSex,
      selectedAge,
      selectedStyle,
      selectedView,
      handleSexChange,
      handleAgeChange,
      handleStyleChange,
      handleViewChange,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.container {
  padding: 25rpx;
}

.section {
  margin-bottom: 30rpx;
}

.submit-section {
  margin-top: 75rpx;
}

.upload-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200rpx;
  background-color: #fff;
  border: 1rpx dashed #333;
  color: #333;
  font-size: 20rpx;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.label {
  display: block;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
}

.radio-label {
  font-size: 14px;
}

.radio-buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.radio-button {
  display: inline-block;
  padding: 10px 20px;
  background-color: #f5f5f5;
  border-radius: 5px;
  border: 1px solid #ddd;
  text-align: center;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s, border-color 0.3s;
  width: 150rpx;
}

.radio-button radio {
  visibility: hidden;
  position: absolute;
}

.radio-button.checked {
  background-color: #007aff;
  color: #fff;
  border-color: #007aff;
}

</style>
