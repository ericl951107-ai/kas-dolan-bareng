import nodemailer from 'nodemailer'

// Create transporter using Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password (bukan password biasa)
    },
  })
}

// Send verification email
export const sendVerificationEmail = async (email, name, code) => {
  const transporter = createTransporter()

  const mailOptions = {
    from: `"Kas Dolan Bareng" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Kode Verifikasi - Kas Dolan Bareng',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 500px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 24px; }
          .body { padding: 30px; }
          .code-box { background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .code { font-size: 42px; font-weight: bold; letter-spacing: 10px; color: #16a34a; }
          .note { color: #666; font-size: 14px; text-align: center; margin-top: 10px; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Kas Dolan Bareng</h1>
            <p style="margin:5px 0 0 0; opacity:0.9">Verifikasi Email Anda</p>
          </div>
          <div class="body">
            <p>Halo <strong>${name}</strong>,</p>
            <p>Gunakan kode verifikasi berikut untuk menyelesaikan pendaftaran akun Anda:</p>
            <div class="code-box">
              <div class="code">${code}</div>
              <p class="note">⏰ Kode berlaku selama <strong>10 menit</strong></p>
            </div>
            <p>Jika Anda tidak mendaftar di Kas Dolan Bareng, abaikan email ini.</p>
            <p style="color:#888; font-size:13px;">Jangan bagikan kode ini kepada siapapun.</p>
          </div>
          <div class="footer">
            © 2026 Kas Dolan Bareng &mdash; Kelola kas bersama dengan mudah
          </div>
        </div>
      </body>
      </html>
    `,
  }

  await transporter.sendMail(mailOptions)
}

// Send approval notification email
export const sendApprovalEmail = async (email, name, amount, status, reason = '') => {
  const transporter = createTransporter()
  const isApproved = status === 'approved'

  const mailOptions = {
    from: `"Kas Dolan Bareng" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: isApproved
      ? '✅ Pembayaran Disetujui - Kas Dolan Bareng'
      : '❌ Pembayaran Ditolak - Kas Dolan Bareng',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 500px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: ${isApproved ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #ef4444, #dc2626)'}; padding: 30px; text-align: center; color: white; }
          .body { padding: 30px; }
          .amount { font-size: 32px; font-weight: bold; color: ${isApproved ? '#16a34a' : '#dc2626'}; text-align: center; margin: 15px 0; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isApproved ? '✅ Pembayaran Disetujui' : '❌ Pembayaran Ditolak'}</h1>
          </div>
          <div class="body">
            <p>Halo <strong>${name}</strong>,</p>
            ${isApproved
              ? `<p>Pembayaran Anda telah <strong>disetujui</strong> oleh admin/bendahara.</p>`
              : `<p>Pembayaran Anda <strong>ditolak</strong> oleh admin/bendahara.</p>`
            }
            <div class="amount">Rp ${parseInt(amount).toLocaleString('id-ID')}</div>
            ${!isApproved && reason ? `<p><strong>Alasan:</strong> ${reason}</p>` : ''}
            ${!isApproved ? `<p>Silakan upload ulang bukti transfer yang valid.</p>` : ''}
          </div>
          <div class="footer">© 2026 Kas Dolan Bareng</div>
        </div>
      </body>
      </html>
    `,
  }

  await transporter.sendMail(mailOptions)
}
