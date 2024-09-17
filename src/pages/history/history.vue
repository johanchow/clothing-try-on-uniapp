<template>
  <view class="container">
    <view class="date-group" v-for="(group, index) in groupedImages" :key="index">
      <view class="date">{{ group.date }}</view>
      <view class="image-list">
        <view v-for="(image, imgIndex) in group.images" :key="imgIndex" class="image-item">
          <image class="image" :src="image.generation_image_url" mode="aspectFit" />
          <span class="image-missing" v-if="!image.generation_image_url">处理中</span>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { requestTryonHistory } from '@/utils/request';
import { inject, ref, onBeforeMount } from 'vue';
import type { Ref } from 'vue'
import { onShow} from '@dcloudio/uni-app';
import { UserInfo } from '@/typing.ts';

type ImageItem = {
  date: string;
  generation_image_url: string;
}
type ImageGroup = {
  date: string;
  images: Array<ImageItem>;
}

export default {
  setup() {
    const groupedImages = ref<ImageGroup[]>([]);
    const userInfo = inject<Ref<UserInfo>>('userInfo')!;

    const fetchImages = async () => {
      const historyData = await requestTryonHistory(userInfo.value.openid);
      const grouped: {[date in string]: ImageItem[]} = {};
      historyData.forEach((image: any) => {
        if (!grouped[image.date]) {
          grouped[image.date] = [];
        }
        grouped[image.date].push(image);
      });
      groupedImages.value = Object.entries(grouped).map(([date, images]) => ({
        date,
        images
      }));
      console.log('groupImages: ', groupedImages.value);
    };

    onShow(() => {
      fetchImages();
    });

    onBeforeMount(() => {
      setInterval(async () => {
        fetchImages();
      }, 30 * 1000);
      fetchImages();
    });

    return {
      groupedImages,
    };
  }
};
</script>

<style lang="scss">
.container {
  padding: 10px;
}
.date-group {
  margin-bottom: 20px;
}
.date {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}
.image-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.image-item {
  position: relative;
  padding: 5rpx;
  image {
    width: 220rpx;
    height: 330rpx;
    background-color: #eee;
    object-fit: cover;
  }
  .image-missing {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #aaa;
    font-size: 28rpx;
  }
}
</style>

