const nodemailer = require('nodemailer');

if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
  throw new Error('MAIL credentials missing');
}

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const FSCAPE_LOGO_URL = 'https://res.cloudinary.com/dz0rxiivc/image/upload/v1772824029/fscape-logo_qkmcfz.svg';

/**
 * Tạo email wrapper HTML với branding FScape.
 */
const wrapEmailTemplate = (bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family:'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:#011936; padding:24px 32px; text-align:center;">
              <img src="${FSCAPE_LOGO_URL}" alt="FScape" height="40" style="height:40px;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f4f4f5; padding:16px 32px; text-align:center; font-size:12px; color:#71717a;">
              <p style="margin:0;">FScape — Student Housing Platform</p>
              <p style="margin:4px 0 0;">Email này được gửi tự động, vui lòng không trả lời.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

exports.sendOtpMail = async (email, code) => {
  await transporter.sendMail({
    from: `"FScape" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Mã xác thực OTP — FScape',
    html: wrapEmailTemplate(`
      <h2 style="margin:0 0 8px; color:#011936;">Mã xác thực OTP</h2>
      <p style="margin:0 0 16px; color:#52525b;">Vui lòng sử dụng mã bên dưới để xác thực tài khoản của bạn:</p>
      <div style="background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:16px; text-align:center; margin:0 0 16px;">
        <span style="font-size:32px; font-weight:700; letter-spacing:8px; color:#011936;">${code}</span>
      </div>
      <p style="margin:0; color:#71717a; font-size:13px;">Mã này sẽ hết hạn sau 5 phút.</p>
    `),
  });
};

/**
 * Gửi email mời ký hợp đồng cho customer.
 */
/**
 * Gửi email thông báo cho BM rằng customer đã ký, mời BM ký xác nhận.
 */
exports.sendManagerSigningEmail = async (email, { managerName, customerName, contractNumber, roomNumber, buildingName, signingUrl }) => {
  await transporter.sendMail({
    from: `"FScape" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `Hợp đồng ${contractNumber} — Khách hàng đã ký, chờ bạn xác nhận`,
    html: wrapEmailTemplate(`
      <h2 style="margin:0 0 8px; color:#011936;">Xin chào ${managerName},</h2>
      <p style="margin:0 0 16px; color:#52525b;">
        Khách hàng <strong>${customerName}</strong> đã ký hợp đồng thuê phòng. Vui lòng xem xét và ký xác nhận để kích hoạt hợp đồng.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; margin:0 0 24px;">
        <tr>
          <td style="padding:16px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:4px 0; color:#64748b; font-size:13px;">Số hợp đồng</td>
                <td style="padding:4px 0; text-align:right; font-weight:600; color:#011936;">${contractNumber}</td>
              </tr>
              <tr>
                <td style="padding:4px 0; color:#64748b; font-size:13px;">Phòng</td>
                <td style="padding:4px 0; text-align:right; font-weight:600; color:#011936;">${roomNumber}</td>
              </tr>
              <tr>
                <td style="padding:4px 0; color:#64748b; font-size:13px;">Tòa nhà</td>
                <td style="padding:4px 0; text-align:right; font-weight:600; color:#011936;">${buildingName}</td>
              </tr>
              <tr>
                <td style="padding:4px 0; color:#64748b; font-size:13px;">Khách hàng</td>
                <td style="padding:4px 0; text-align:right; font-weight:600; color:#011936;">${customerName}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <a href="${signingUrl}" style="display:inline-block; background-color:#011936; color:#ffffff; text-decoration:none; padding:12px 32px; border-radius:6px; font-weight:600; font-size:15px;">
              Xem và ký hợp đồng
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:24px 0 0; color:#71717a; font-size:13px;">
        Vui lòng ký xác nhận trong vòng 24 giờ. Sau thời hạn trên, hợp đồng sẽ tự động hủy.
      </p>
      <p style="margin:8px 0 0; color:#71717a; font-size:13px;">
        Nếu nút không hoạt động, hãy sao chép đường dẫn sau vào trình duyệt:<br/>
        <a href="${signingUrl}" style="color:#2563eb; word-break:break-all;">${signingUrl}</a>
      </p>
    `),
  });
};

/**
 * Gửi email xác nhận hợp đồng đã được kích hoạt cho resident.
 */
exports.sendContractActivatedEmail = async (email, { customerName, contractNumber, roomNumber, buildingName, startDate }) => {
  await transporter.sendMail({
    from: `"FScape" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `Hợp đồng ${contractNumber} — Đã kích hoạt thành công`,
    html: wrapEmailTemplate(`
      <h2 style="margin:0 0 8px; color:#011936;">Xin chào ${customerName},</h2>
      <p style="margin:0 0 16px; color:#52525b;">
        Hợp đồng thuê phòng của bạn đã được quản lý tòa nhà ký xác nhận và <strong>kích hoạt thành công</strong>.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; margin:0 0 24px;">
        <tr>
          <td style="padding:16px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:4px 0; color:#64748b; font-size:13px;">Số hợp đồng</td>
                <td style="padding:4px 0; text-align:right; font-weight:600; color:#011936;">${contractNumber}</td>
              </tr>
              <tr>
                <td style="padding:4px 0; color:#64748b; font-size:13px;">Phòng</td>
                <td style="padding:4px 0; text-align:right; font-weight:600; color:#011936;">${roomNumber}</td>
              </tr>
              <tr>
                <td style="padding:4px 0; color:#64748b; font-size:13px;">Tòa nhà</td>
                <td style="padding:4px 0; text-align:right; font-weight:600; color:#011936;">${buildingName}</td>
              </tr>
              <tr>
                <td style="padding:4px 0; color:#64748b; font-size:13px;">Ngày bắt đầu</td>
                <td style="padding:4px 0; text-align:right; font-weight:600; color:#16a34a;">${startDate}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 8px; color:#52525b;">
        Bạn chính thức trở thành cư dân tại <strong>${buildingName}</strong>. Chúc bạn có trải nghiệm tuyệt vời!
      </p>
      <p style="margin:0; color:#71717a; font-size:13px;">
        Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ quản lý tòa nhà qua hệ thống FScape.
      </p>
    `),
  });
};

/**
 * Gửi email mời ký hợp đồng cho customer.
 */
exports.sendContractSigningEmail = async (email, { customerName, contractNumber, roomNumber, buildingName, signingUrl }) => {
  await transporter.sendMail({
    from: `"FScape" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `Hợp đồng ${contractNumber} — Vui lòng ký xác nhận`,
    html: wrapEmailTemplate(`
      <h2 style="margin:0 0 8px; color:#011936;">Xin chào ${customerName},</h2>
      <p style="margin:0 0 16px; color:#52525b;">
        Hợp đồng thuê phòng của bạn đã được tạo thành công. Vui lòng xem xét và ký xác nhận hợp đồng.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; margin:0 0 24px;">
        <tr>
          <td style="padding:16px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:4px 0; color:#64748b; font-size:13px;">Số hợp đồng</td>
                <td style="padding:4px 0; text-align:right; font-weight:600; color:#011936;">${contractNumber}</td>
              </tr>
              <tr>
                <td style="padding:4px 0; color:#64748b; font-size:13px;">Phòng</td>
                <td style="padding:4px 0; text-align:right; font-weight:600; color:#011936;">${roomNumber}</td>
              </tr>
              <tr>
                <td style="padding:4px 0; color:#64748b; font-size:13px;">Tòa nhà</td>
                <td style="padding:4px 0; text-align:right; font-weight:600; color:#011936;">${buildingName}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <a href="${signingUrl}" style="display:inline-block; background-color:#011936; color:#ffffff; text-decoration:none; padding:12px 32px; border-radius:6px; font-weight:600; font-size:15px;">
              Xem và ký hợp đồng
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:24px 0 0; color:#71717a; font-size:13px;">
        Bạn có 24 giờ để ký hợp đồng kể từ khi nhận email này. Sau thời hạn trên, hợp đồng sẽ tự động hủy.
      </p>
      <p style="margin:8px 0 0; color:#71717a; font-size:13px;">
        Nếu nút không hoạt động, hãy sao chép đường dẫn sau vào trình duyệt:<br/>
        <a href="${signingUrl}" style="color:#2563eb; word-break:break-all;">${signingUrl}</a>
      </p>
    `),
  });
};
