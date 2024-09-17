<template>
  <view class="container">
    <view class="date-group" v-for="(group, index) in groupedImages" :key="index">
      <view class="date">{{ group.date }}</view>
      <view class="image-list">
        <view v-for="(image, imgIndex) in group.images" :key="imgIndex" class="image-item">
          <image class="image" :src="image.generation_image_url" mode="aspectFit" />
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { requestTryonHistory } from '@/utils/request';
import { inject, ref, onMounted, onBeforeMount } from 'vue';
import type { Ref } from 'vue'
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
    const images = ref<ImageItem[]>([
      // { date: '2022-01-01', generation_image_url: 'https://res.cloudinary.com/dsiza0wtm/image/upload/v1725063065/clothing1_oj22tq.jpg' },
      // { date: '2022-01-01', generation_image_url: 'https://clothing-try-on-1306401232.cos.ap-guangzhou.myqcloud.com/image.png' },
      // { date: '2022-01-01', generation_image_url: 'https://res.cloudinary.com/dsiza0wtm/image/upload/v1725063065/clothing1_oj22tq.jpg' },
      // { date: '2022-01-01', generation_image_url: 'https://res.cloudinary.com/dsiza0wtm/image/upload/v1725063065/clothing1_oj22tq.jpg' },
      // { date: '2022-01-02', generation_image_url: 'https://res.cloudinary.com/dsiza0wtm/image/upload/v1725063065/clothing1_oj22tq.jpg' },
      // { date: '2022-01-02', generation_image_url: 'https://res.cloudinary.com/dsiza0wtm/image/upload/v1725063065/clothing1_oj22tq.jpg' },
      // { date: '2022-01-03', generation_image_url: 'https://res.cloudinary.com/dsiza0wtm/image/upload/v1725063065/clothing1_oj22tq.jpg' },
    ]);

    const groupedImages = ref<ImageGroup[]>([]);
    const userInfo = inject<Ref<UserInfo>>('userInfo')!;

    const groupImages = () => {
      const grouped: {[date in string]: ImageItem[]} = {};
      images.value.forEach(image => {
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

    onMounted(async () => {
      const historyData = await requestTryonHistory(userInfo.value.openid);
      images.value = historyData;
      groupImages();
    });

    onBeforeMount(async () => {
    });

    return {
      images,
      groupedImages,
    };
  },
};
</script>

<style>
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
  width: 210rpx;
  padding: 5px;
}
image {
  width: 100%;
  background-color: #eee;
  object-fit: cover;
}
</style>

