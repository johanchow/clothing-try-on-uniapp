import { ApiHost } from "@/config";

const requestTryonHistory = async (userId: string) => {
  console.log(`开始发送请求: ${ApiHost}/try-on/list-history`);
  const resp = await uni.request({
    url: `${ApiHost}/try-on/list-history`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      user_id: userId,
    },
  });
  console.log('完成发送请求: /try-on/list-history');
  return (resp.data as Record<string, any>).try_on_list.map((item: any) => {
    const d = new Date(item.create_time);
    const dateString = d.getFullYear() + '-' +
    ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
    ('0' + d.getDate()).slice(-2);
    return {
      ...item,
      date: dateString,
    };
  });
};

export {
  requestTryonHistory,
};
