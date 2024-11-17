<template>
  <view class="container">
    <view class="date-group" v-for="(group, index) in groupedImages" :key="index">
      <view class="date">{{ group.date }}</view>
      <view class="image-list">
        <view v-for="(image, imgIndex) in group.images" :key="imgIndex" class="image-item">
          <image class="image" @click="() => { onPreviewImage(image) }" :src="image.generation_image_url" mode="aspectFit" />
          <span class="image-missing" v-if="!image.generation_image_url && image.progress >= 100">失败</span>
          <div class="image-processing" v-else-if="!image.generation_image_url && image.progress < 100">
            <span class="image-missing">{{ image.progress + '%' }}</span>
            <progress :percent="image.progress" stroke-width="6" backgroundColor="#D8D8D8" border-radius="6" />
          </div>
        </view>
      </view>
    </view>
    <view class="image-preview" v-if="previewImage">
      <image :src="previewImage.generation_image_url" mode="aspectFit" @click="onCancelPreviewImage" />
      <view class="button-group">
        <button @click="startEditImage">修图</button>
        <button @click="() => { saveImage(previewImage!) }">保存</button>
      </view>
    </view>
    <view class="editing-overlay" v-if="isEditingImage">
      <web-view ref="webviewRef" :webview-styles="{progress: {color: '#FF3333'}}"
        :src="webviewUrl"
        @load="sendConstToWebview"
        @message="onMessage"></web-view>
    </view>
  </view>
</template>

<script lang="ts">
import { onHide, onShow, onLoad } from '@dcloudio/uni-app';
import { requestTryonHistory } from '@/utils/request';
import { computed, inject, ref, onBeforeMount, watch } from 'vue';
import { DiyImageUrl } from '@/config';
import type { Ref } from 'vue'
import type { UserInfo } from '@/typing.d.ts';

type ImageItem = {
  id: string; // 生成图generation的id
  date: string;
  generation_image_url: string;
  progress: number;
  create_time: string;
}
type ImageGroup = {
  date: string;
  images: Array<ImageItem>;
}

export default {
  setup() {
    const webviewRef = ref(null);
    const groupedImages = ref<ImageGroup[]>([]);
    const userInfo = inject<Ref<UserInfo>>('userInfo')!;
    const previewImage = ref<ImageItem>();
    const isEditingImage = ref<boolean>(false);
    const webviewUrl = computed(() => {
      const webviewUrl = `${DiyImageUrl}?generation_id=${previewImage.value?.id}`;
      console.log('webview url: ', webviewUrl);
      return webviewUrl;
    });

    const fetchImages = async () => {
      const historyData = await requestTryonHistory(userInfo.value.openid);
      const grouped: {[date in string]: ImageItem[]} = {};
      historyData.forEach((image: ImageItem) => {
        if (!grouped[image.date]) {
          grouped[image.date] = [];
        }
        console.log('image: ', image);
        // 预期是90s内完成，按时间算进度
        const progress = Math.floor( 100 * (Date.now() - new Date(image.create_time).getTime()) / 1000 / 60 / 1.5 );
        image.progress = progress >= 100 ? 100 : progress;
        grouped[image.date].push(image);
      });
      groupedImages.value = Object.entries(grouped).map(([date, images]) => ({
        date,
        images
      }));
      console.log('groupImages: ', groupedImages.value);
    };

    onLoad((e) => {
      console.log('load: ', e);
    });

    onHide(() => {
      console.log('onHide');
      previewImage.value = undefined;
      isEditingImage.value = false;
    });

    onShow(() => {
      fetchImages();
    });

    onBeforeMount(() => {
      setInterval(async () => {
        fetchImages();
      }, 30 * 1000);
      fetchImages();
    });

    const onPreviewImage = (imageItem: ImageItem) => {
      if (!imageItem.generation_image_url) {
        return;
      }
      console.log('preview image: ', imageItem);
      previewImage.value = imageItem;
    };
    const onCancelPreviewImage = () => {
      console.log('onCancelPreviewImage');
      previewImage.value = undefined;
    };
    const startEditImage = (e: MouseEvent) => {
      e.stopPropagation();
      isEditingImage.value = true;
    };
    const saveImage = async (image: ImageItem) => {
      const downloadResp = await uni.downloadFile({
        url: image.generation_image_url
      });
      if (downloadResp.statusCode !== 200) {
        uni.showToast({
          title: '图片保存失败',
          icon: 'none'
        });
        return;
      }
      await uni.saveImageToPhotosAlbum({
        filePath: downloadResp.tempFilePath,
        success: () => {
          uni.showToast({
            title: '图片保存成功',
            icon: 'success'
          });
        },
        fail: () => {
          uni.showToast({
            title: '图片保存失败',
            icon: 'none'
          });
        }
      });
    };

    const sendConstToWebview = () => {
      const globalVariable = {
        userId: userInfo.value.openid,
      };
      // @ts-ignore
      webviewRef.value?.postMessage(globalVariable) // 发送全局变量到Webview
    };

    const onMessage = (event: any) => {
      console.log('on message from webview');
      const data = event.detail?.data?.[0]; // 获取传递过来的数据
      console.log('get message from webview: ', data);
      if (data.action === 'close') {
        // 关闭 WebView 并返回上一页
        uni.navigateBack();
      }
    }

    return {
      groupedImages,
      isEditingImage,
      onPreviewImage,
      onCancelPreviewImage,
      previewImage,
      startEditImage,
      saveImage,
      webviewRef,
      webviewUrl,
      onMessage,
      sendConstToWebview
    };
  }
};
</script>

<style lang="scss" scoped>
.container {
  padding: 10px;
  position: relative;
}
.date-group {
  margin-bottom: 20px;
  .date {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .image-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
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
      .image-processing {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        label {
          position: relative;
          display: inline-block;
          width: 100%;
          text-align: center;
          top: 20rpx;
        }
      }
    }
  }
}
.image-preview {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  align-items: center;
  background-color: #222;
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  image {
    flex: 1;
    object-fit: cover;
  }
  .button-group {
    height: 50rpx;
    margin-bottom: 50rpx;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 60rpx;
    button {
      width: 144rpx;
    }
  }
}
.editing-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background-color: #222;
  &.hidden {
    display: none;
  }
}
</style>

