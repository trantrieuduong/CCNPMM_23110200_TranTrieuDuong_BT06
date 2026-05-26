const setRefreshTokenCookie = (res, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 ngày
    path: '/', // Cho phép truy cập và xóa cookie từ bất kỳ path nào (ví dụ khi gọi /api/auth/logout)
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
};

module.exports = {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};
