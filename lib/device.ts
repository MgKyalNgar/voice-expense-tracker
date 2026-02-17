export const getDeviceId = () => {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem('app_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('app_device_id', id);
  }
  console.log("Current Device ID:", id); // ဒါလေးထည့်ပြီး Console မှာ စစ်ကြည့်ပါ
  return id;
};
