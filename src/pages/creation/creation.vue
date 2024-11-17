<template>
  <view class="container">
    <!-- 上传图片组件 -->
    <view class="section">
      <text class="label">服装图</text>
      <view class="upload-section">
        <view class="upload-btn" @click="uploadClothing">
          <text v-if="!clothingFile">点击上传图片</text>
          <image class="preview-image" v-else :src="clothingFile" mode="aspectFit" />
        </view>
        <view class="upload-demo">
          <text class="upload-demo-title">示例</text>
          <view class="image-example">
            <image src="https://clothing-try-on-1306401232.cos.ap-guangzhou.myqcloud.com/23255574_53383833_1000.jpg" />
            <image src="https://clothing-try-on-1306401232.cos.ap-guangzhou.myqcloud.com/clo2.jpg" />
            <image src="https://clothing-try-on-1306401232.cos.ap-guangzhou.myqcloud.com/clo6.jpg" />
            <image src="https://clothing-try-on-1306401232.cos.ap-guangzhou.myqcloud.com/dress3rfasf23rf323535.jpg" />
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="label">人物图类型</text>
      <radio-group @change="handlePersonTypeChange">
        <view class="radio-buttons" :style="{ width: '400rpx'}">
          <label class="radio" :class="{'checked': selectedPersonType === 'uploaded'}">
            <radio value="uploaded" checked="true" />上传
          </label>
          <label class="radio" :class="{'checked': selectedPersonType === 'ai'}">
            <radio value="ai" />AI生成
          </label>
        </view>
      </radio-group>
    </view>

    <view v-if="selectedPersonType === 'uploaded'" class="section">
      <text class="label">人物图</text>
      <view class="upload-section">
        <view class="upload-btn" @click="uploadPerson">
          <text v-if="!personFile">点击上传图片</text>
          <image class="preview-image" v-else :src="personFile" mode="aspectFit" />
        </view>
        <view class="upload-demo">
          <text class="upload-demo-title">示例</text>
          <view class="image-example">
            <image src="https://clothing-try-on-1306401232.cos.ap-guangzhou.myqcloud.com/presave_persons/female-junior-pure-3.webp" />
            <image src="https://clothing-try-on-1306401232.cos.ap-guangzhou.myqcloud.com/presave_persons/female-junior-pure-4.png" />
            <image src="https://clothing-try-on-1306401232.cos.ap-guangzhou.myqcloud.com/input_image.png" />
            <image src="https://clothing-try-on-1306401232.cos.ap-guangzhou.myqcloud.com/man23rfsaf3d.png" />
          </view>
        </view>
      </view>
    </view>
    <view v-else class="section">
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
          <label class="radio-label">背景</label>
          <radio-group @change="handleBgChange">
            <view class="radio-buttons">
              <label class="radio radio-button" :class="{'checked': selectedBg === 'pure'}">
                <radio value="pure" />纯色
              </label>
              <label class="radio radio-button" :class="{'checked': selectedBg === 'urban'}">
                <radio value="urban" />街景
              </label>
              <label class="radio radio-button" :class="{'checked': selectedBg === 'scenery'}">
                <radio value="scenery" />自然景
              </label>
            </view>
          </radio-group>
        </view>
        <view>
          <label class="radio-label">视角</label>
          <radio-group @change="handleStyleChange">
            <view class="radio-buttons">
              <label class="radio radio-button" :class="{'checked': selectedStyle === 'full-body'}">
                <radio value="full-body" />全身照
              </label>
              <label class="radio radio-button" :class="{'checked': selectedStyle === 'upper-body'}">
                <radio value="upper-body" />上身照
              </label>
              <label class="radio radio-button" :class="{'checked': selectedStyle === 'lower-body'}">
                <radio value="lower-body" />下身照
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
import { ApiCreateImageUrl, ApiHost } from '@/config';
import { FileType, UserInfo } from '@/typing.d.ts';

export default {
  setup() {
    // 定义图片列表的状态
    const selectedClothingId = ref('');
    const selectedPersonId = ref('');
    const clothingFile = ref('');
    const personFile = ref('');
    const uploadClothingPromise = ref<Promise<string> | undefined>(undefined);
    const uploadPersonPromise = ref<Promise<string> | undefined>(undefined);

    // 人物图类型
    const selectedPersonType = ref<string>('uploaded');

    // 记录用户选择
    const selectedSex = ref<string>('female');
    const selectedAge = ref<string>('junior');
    const selectedBg = ref<string>('pure');
    const selectedStyle = ref<string>('full-body');

    const userInfo = inject<Ref<UserInfo>>('userInfo')!;

    const chooseAndUpload = async (fileType: FileType): Promise<string> => {
      let fileRef: Ref<string>;
      let keyName: string;
      let uploadApi: string;
      if (fileType === FileType.clothing) {
        fileRef = clothingFile;
        keyName = 'clothing_image';
        uploadApi = `${ApiHost}/real-clothing/upload`;
      } else {
        fileRef = personFile;
        keyName = 'person_image';
        uploadApi = `${ApiHost}/person/upload`;
      }
      return new Promise((resolve) => {
        uni.chooseImage({
          count: 1,
          sourceType: ['album', 'camera'],
          success: function (res) {
            console.log('filePath: ', res.tempFilePaths[0]);
            fileRef.value = res.tempFilePaths[0];
            uni.uploadFile({
              url: uploadApi,
              filePath: res.tempFilePaths[0],
              name: keyName,
              formData: {
                user_id: userInfo.value.openid,
              },
              success: (res) => {
                if (res.statusCode !== 200) {
                  return;
                }
                const { resource_id: fileId, message } = JSON.parse(res.data);
                if (!fileId) {
                  uni.showToast({
                    title: message,
                    icon: 'none'
                  });
                  return;
                }
                console.log('fileId: ', fileId);
                resolve(fileId);
                // selectedFileId.value = JSON.parse(res.data).resource_id;
              }
            });
          }
        });
      });
    };

    const uploadClothing = async () => {
      const promise = chooseAndUpload(FileType.clothing);
      uploadClothingPromise.value = promise;
      selectedClothingId.value = await promise;
    };

    const uploadPerson = async () => {
      const promise = chooseAndUpload(FileType.person);
      uploadPersonPromise.value = promise;
      selectedPersonId.value = await promise;
    };

    const handlePersonTypeChange = (e: any) => {
      selectedPersonType.value = e.detail.value;
    };
    // 选择器选择回调
    const handleSexChange = (e: any) => {
      selectedSex.value = e.detail.value;
    };
    const handleAgeChange = (e: any) => {
      console.log('e: ', e);
      selectedAge.value = e.detail.value;
    };
    const handleStyleChange = (e: any) => {
      console.log('e: ', e);
      selectedStyle.value = e.detail.value;
    };
    const handleBgChange = (e: any) => {
      console.log('e: ', e);
      selectedBg.value = e.detail.value;
    };

    // 提交按钮点击事件
    const handleSubmit = async () => {
      if (!selectedClothingId.value) {
        uni.showToast({
          title: '请上传服装图片',
          icon: 'none'
        });
        return;
      }
      await uploadClothingPromise.value;
      const payload: Record<string, string> = {
        user_id: userInfo.value.openid,
        real_clothing_id: selectedClothingId.value,
      };
      if (selectedPersonType.value === 'uploaded') {
        if (!selectedPersonId.value) {
          uni.showToast({
            title: '请上传人物图片',
            icon: 'none'
          });
          return;
        }
        await uploadPersonPromise;
        Object.assign(payload, {
          person_id: selectedPersonId.value,
        });
      } else {
        Object.assign(payload, {
          gender: selectedSex.value,
          age: selectedAge.value,
          bg: selectedBg.value,
        });
      }
      console.log(`开始发送请求，生成AI图片: ${ApiCreateImageUrl}`);
      uni.request({
        url: ApiCreateImageUrl,
        method: 'POST',
        data: payload,
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
      clothingFile,
      personFile,
      selectedPersonType,
      selectedSex,
      selectedAge,
      selectedBg,
      selectedStyle,
      handlePersonTypeChange,
      handleSexChange,
      handleAgeChange,
      handleBgChange,
      handleStyleChange,
      handleSubmit,
      uploadClothing,
      uploadPerson
    };
  }
};
</script>

<style lang="scss" scoped>
.container {
  padding: 25rpx;
}

$demo-image-gap: 20rpx;

.section {
  margin-bottom: 30rpx;
  .upload-section {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: flex-start;
    .upload-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 600rpx;
      background-color: #fff;
      border: 1rpx dashed #333;
      color: #333;
      font-size: 20rpx;
      flex: 1;
    }
    .upload-demo {
      margin-left: 20rpx;
      width: 280rpx;
      .upload-demo-title {
        text-align: center;
        display: inline-block;
        width: 100%;
        font-size: 14px;
        font-weight: bold;
        margin-bottom: $demo-image-gap;
      }
      .image-example {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-between;
        row-gap: $demo-image-gap;
        image {
          width: 120rpx;
          height: 180rpx;
          border: 1px solid #d8d8d8;
          border-radius: 4px;
        }
      }
    }
  }
}

.submit-section {
  margin-top: 75rpx;
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
