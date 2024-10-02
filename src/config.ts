let ApiHost: string;
// @ts-ignore
if (process.env.NODE_ENV === 'development') {
  ApiHost = 'http://localhost:5000';
} else {
  ApiHost = 'https://clothing-try-on-123543-7-1330028415.sh.run.tcloudbase.com';
}
const ApiUploadImageUrl = `${ApiHost}/real-clothing/upload`;
const ApiCreateImageUrl = `${ApiHost}/try-on/generate`;

export {
  ApiHost,
  ApiCreateImageUrl,
  ApiUploadImageUrl,
};;
