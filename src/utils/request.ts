import { ApiHost } from "@/config";

const requestTryonHistory = async (userId: string) => {
  const resp = await uni.request({
    url: `${ApiHost}/try-on/list-history`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      user_id: 'xxxxxxx',
    },
  });
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
