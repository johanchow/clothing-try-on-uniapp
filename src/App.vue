<script setup lang="ts">
import { ref, provide } from "vue";
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import type { UserInfo } from "./typing.d.ts";

const userInfoRef = ref<UserInfo>({
  nickName: '',
  avatarUrl: '',
  openid: ''
});

onLaunch(async () => {
  console.log("App Launch");
  const userInfo = uni.getStorageSync('userInfo');
  if (userInfo) {
    console.log('已登录用户态: ', userInfo);
  }
  userInfoRef.value = userInfo || {
    nickName: '匿名用户',
    avatarUrl: '',
    openid: ''
  };
  uni.setStorage({
    key: 'userInfo',
    data: userInfo,
  })
}),
onShow(async () => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});

provide('userInfo', userInfoRef);
</script>
<style></style>
