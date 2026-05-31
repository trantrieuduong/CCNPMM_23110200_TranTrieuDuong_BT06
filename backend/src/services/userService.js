const userRepository = require('../repositories/userRepository');
const ApiError = require('../utils/ApiError');
const redis = require('../config/redis');
const emailService = require('./emailService');

class UserService {
  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('Không tìm thấy người dùng');
    }
    return user;
  }

  // Yêu cầu OTP thay đổi địa chỉ email
  async requestChangeEmailOTP(userId, newEmail) {
    if (!newEmail) {
      throw ApiError.badRequest('Vui lòng cung cấp địa chỉ email mới');
    }

    const user = await this.getMe(userId);
    if (user.email === newEmail) {
      throw ApiError.badRequest('Địa chỉ email mới trùng khớp với email hiện tại của bạn');
    }

    // Kiểm tra xem email mới đã được sử dụng chưa
    const emailExists = await userRepository.findByEmail(newEmail);
    if (emailExists) {
      throw ApiError.badRequest('Email này đã được đăng ký bởi người dùng khác');
    }

    // Sinh ngẫu nhiên mã OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const redisKey = `otp:change-email:${userId}:${newEmail}`;

    // Lưu vào Redis với hạn 5 phút (300 giây)
    await redis.setOTP(redisKey, otp, 300);

    // Gửi email OTP
    await emailService.sendOTPEmail(newEmail, otp, 'change-email');

    return {
      success: true,
      message: 'Mã OTP xác thực đã được gửi tới địa chỉ email mới của bạn.'
    };
  }

  async updateProfile(userId, updateData) {
    const { name, email, otp } = updateData;
    const user = await this.getMe(userId);

    let finalEmail = user.email;

    // Nếu người dùng yêu cầu thay đổi email
    if (email && email !== user.email) {
      // Yêu cầu phải cung cấp OTP
      if (!otp) {
        throw ApiError.badRequest('Vui lòng cung cấp mã OTP để xác thực thay đổi địa chỉ email');
      }

      // Xác minh OTP trong Redis
      const redisKey = `otp:change-email:${userId}:${email}`;
      const cachedOtp = await redis.getOTP(redisKey);

      if (!cachedOtp) {
        throw ApiError.badRequest('Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng gửi lại yêu cầu.');
      }

      if (cachedOtp !== otp.toString()) {
        throw ApiError.badRequest('Mã OTP xác thực email mới không chính xác');
      }

      // Kiểm tra lại tính hợp lệ của email
      const emailExists = await userRepository.findByEmail(email);
      if (emailExists && emailExists._id.toString() !== userId.toString()) {
        throw ApiError.badRequest('Email này đã được đăng ký bởi người dùng khác');
      }

      finalEmail = email;

      // Xóa OTP trong Redis sau khi đã verify thành công
      await redis.deleteOTP(redisKey);
    }

    // Tiến hành cập nhật thông tin
    const updatedUser = await userRepository.updateById(userId, { 
      name: name || user.name, 
      email: finalEmail 
    });
    
    if (!updatedUser) {
      throw ApiError.notFound('Không tìm thấy người dùng');
    }

    return {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    };
  }

  async getAddresses(userId) {
    const user = await this.getMe(userId);
    return user.addresses || [];
  }

  async addAddress(userId, addressData) {
    const { fullName, phoneNumber, address, isDefault } = addressData;
    const user = await this.getMe(userId);

    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    const shouldBeDefault = user.addresses.length === 0 ? true : isDefault;

    user.addresses.push({ fullName, phoneNumber, address, isDefault: shouldBeDefault });
    await userRepository.save(user);
    return user.addresses;
  }

  async updateAddress(userId, addressId, addressData) {
    const { fullName, phoneNumber, address, isDefault } = addressData;
    const user = await this.getMe(userId);

    const addr = user.addresses.id(addressId);
    if (!addr) {
      throw ApiError.notFound('Không tìm thấy địa chỉ');
    }

    if (isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }

    addr.fullName = fullName;
    addr.phoneNumber = phoneNumber;
    addr.address = address;
    if (isDefault !== undefined) {
      addr.isDefault = isDefault;
    }

    await userRepository.save(user);
    return user.addresses;
  }

  async deleteAddress(userId, addressId) {
    const user = await this.getMe(userId);
    const addr = user.addresses.id(addressId);
    if (!addr) {
      throw ApiError.notFound('Không tìm thấy địa chỉ');
    }

    const wasDefault = addr.isDefault;
    user.addresses.pull(addressId);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await userRepository.save(user);
    return user.addresses;
  }

  async setDefaultAddress(userId, addressId) {
    const user = await this.getMe(userId);
    const addr = user.addresses.id(addressId);
    if (!addr) {
      throw ApiError.notFound('Không tìm thấy địa chỉ');
    }

    user.addresses.forEach(a => a.isDefault = false);
    addr.isDefault = true;

    await userRepository.save(user);
    return user.addresses;
  }
}

module.exports = new UserService();
