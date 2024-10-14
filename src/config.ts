let ApiHost: string;
let DiyImageUrl: string;
// @ts-ignore
if (process.env.NODE_ENV === 'development') {
  ApiHost = 'http://localhost:5000';
  DiyImageUrl = `http://localhost:5000/static/diy-image`;
  // ApiHost = 'https://clothing-try-on-123543-7-1330028415.sh.run.tcloudbase.com';
  // DiyImageUrl = 'https://clothing-try-on-123543-7-1330028415.sh.run.tcloudbase.com/static/diy-image';
} else {
  ApiHost = 'https://clothing-try-on-123543-7-1330028415.sh.run.tcloudbase.com';
  DiyImageUrl = 'https://clothing-try-on-123543-7-1330028415.sh.run.tcloudbase.com/static/diy-image';
}
const ApiUploadImageUrl = `${ApiHost}/real-clothing/upload`;
const ApiCreateImageUrl = `${ApiHost}/try-on/generate`;

export {
  ApiHost,
  ApiCreateImageUrl,
  ApiUploadImageUrl,
  DiyImageUrl,
};;
