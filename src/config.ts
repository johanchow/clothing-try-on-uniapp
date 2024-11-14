let ApiHost: string;
let DiyImageUrl: string;
// @ts-ignore
if (process.env.NODE_ENV === 'development') {
  console.log('接口环境111: development')
  // ApiHost = 'http://localhost:5000';
  // DiyImageUrl = `http://localhost:3000/diy-image`;
  ApiHost = 'https://hewohua.com/clothing-try-on';
  DiyImageUrl = 'https://hewohua.com/clothing-try-on/web-static/diy-image';
} else {
  console.log('接口环境: prod');
  ApiHost = 'https://hewohua.com/clothing-try-on';
  DiyImageUrl = 'https://hewohua.com/clothing-try-on/web-static/diy-image';
}
const ApiCreateImageUrl = `${ApiHost}/try-on/generate`;

export {
  ApiHost,
  ApiCreateImageUrl,
  DiyImageUrl,
};;
