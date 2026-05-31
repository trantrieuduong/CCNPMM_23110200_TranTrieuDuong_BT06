const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

client.on('error', (err) => console.error('Lỗi kết nối Redis Client:', err));
client.on('connect', () => console.log('Redis Client đã kết nối thành công'));

(async () => {
  try {
    await client.connect();
  } catch (error) {
    console.error('Không thể kết nối đến Redis server:', error);
  }
})();

module.exports = {
  client,
  
  async setOTP(key, otp, ttlInSeconds = 300) {
    try {
      await client.setEx(key, ttlInSeconds, otp.toString());
      return true;
    } catch (error) {
      console.error('Lỗi khi set OTP trong Redis:', error);
      return false;
    }
  },

  // Lấy mã OTP
  async getOTP(key) {
    try {
      return await client.get(key);
    } catch (error) {
      console.error('Lỗi khi get OTP từ Redis:', error);
      return null;
    }
  },

  // Xóa mã OTP ngay khi đã xác thực xong
  async deleteOTP(key) {
    try {
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Lỗi khi delete OTP từ Redis:', error);
      return false;
    }
  }
};
