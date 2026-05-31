const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // Sử dụng TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

class EmailService {
  async sendOTPEmail(toEmail, otp, type = 'verify-email') {
    let subject = '';
    let title = '';
    let description = '';
    let actionText = '';

    if (type === 'verify-email') {
      subject = '[SNEAKERLAB] - Xác thực địa chỉ Email của bạn';
      title = 'XÁC THỰC EMAIL ĐĂNG KÝ';
      description = 'Cảm ơn bạn đã lựa chọn trở thành thành viên của đại gia đình SNEAKERLAB. Vui lòng sử dụng mã OTP dưới đây để xác thực địa chỉ email và hoàn thành thủ tục kích hoạt tài khoản của bạn:';
      actionText = 'Mã OTP kích hoạt tài khoản của bạn:';
    } else if (type === 'change-email') {
      subject = '[SNEAKERLAB] - Xác thực thay đổi địa chỉ Email';
      title = 'THAY ĐỔI EMAIL TÀI KHOẢN';
      description = 'Chúng tôi nhận được yêu cầu thay đổi địa chỉ email liên kết với tài khoản SNEAKERLAB của bạn. Vui lòng sử dụng mã OTP dưới đây để xác nhận địa chỉ email mới này:';
      actionText = 'Mã OTP xác thực email mới của bạn:';
    } else {
      subject = '[SNEAKERLAB] - Yêu cầu đặt lại mật khẩu tài khoản';
      title = 'ĐẶT LẠI MẬT KHẨU';
      description = 'Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản SNEAKERLAB liên kết với email này. Vui lòng sử dụng mã OTP dưới đây để tiến hành thiết lập mật khẩu mới:';
      actionText = 'Mã OTP đặt lại mật khẩu của bạn:';
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            border: 1px solid #f0f0f0;
          }
          .header {
            background-color: #09090b;
            padding: 40px;
            text-align: center;
            border-bottom: 3px solid #ef4444;
          }
          .logo {
            font-size: 28px;
            font-weight: 900;
            color: #ffffff;
            letter-spacing: 2px;
            margin: 0;
          }
          .logo span {
            color: #ef4444;
          }
          .content {
            padding: 40px;
            color: #1f2937;
            line-height: 1.6;
          }
          .title {
            font-size: 20px;
            font-weight: 800;
            color: #09090b;
            margin-top: 0;
            margin-bottom: 20px;
            letter-spacing: -0.5px;
          }
          .description {
            font-size: 14px;
            color: #4b5563;
            margin-bottom: 30px;
            font-weight: 500;
          }
          .otp-box {
            background-color: #f4f4f5;
            border: 1.5px dashed #ef4444;
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-label {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            color: #71717a;
            letter-spacing: 1.5px;
            margin-bottom: 10px;
          }
          .otp-code {
            font-size: 38px;
            font-weight: 900;
            color: #ef4444;
            letter-spacing: 6px;
            font-family: 'Courier New', Courier, monospace;
            margin: 0;
          }
          .warning {
            font-size: 12px;
            color: #a1a1aa;
            text-align: center;
            margin-top: 30px;
            font-weight: 600;
          }
          .footer {
            background-color: #f4f4f5;
            padding: 30px;
            text-align: center;
            font-size: 11px;
            color: #71717a;
            border-top: 1px solid #e4e4e7;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">SNEAKER<span>LAB</span></h1>
          </div>
          <div class="content">
            <h2 class="title">${title}</h2>
            <p class="description">${description}</p>
            
            <div class="otp-box">
              <div class="otp-label">${actionText}</div>
              <div class="otp-code">${otp}</div>
            </div>
            
            <p class="warning">Lưu ý: Mã OTP này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai để bảo mật thông tin.</p>
          </div>
          <div class="footer">
            <p>© 2026 SNEAKERLAB. All rights reserved.</p>
            <p>Email này được gửi tự động, vui lòng không phản hồi thư này.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"SNEAKERLAB" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: subject,
        html: htmlContent
      });
      return true;
    } catch (error) {
      console.error('Lỗi khi gửi email OTP:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
