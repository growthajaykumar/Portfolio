import nodemailer from 'nodemailer';

function clean(value, maxLength) {
  return String(value || '').replace(/[\r\n]/g, ' ').trim().slice(0, maxLength);
}

export async function POST(request) {
  const form = await request.formData();
  if (clean(form.get('company_website'), 200)) return Response.json({ ok: true });

  const name = clean(form.get('name'), 120);
  const email = clean(form.get('email'), 200);
  const company = clean(form.get('company'), 160);
  const message = clean(form.get('message'), 4000);

  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) {
    return Response.json({ error: 'Please complete the required fields.' }, { status: 400 });
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return Response.json({ error: 'Contact delivery is not configured yet.' }, { status: 503 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
  });

  await transporter.sendMail({
    from: process.env.CONTACT_FROM || process.env.SMTP_USER,
    to: process.env.CONTACT_TO || 'ajay@growthwithajay.com',
    replyTo: email,
    subject: `New enquiry from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nCompany: ${company}\n\n${message}`
  });

  return Response.json({ ok: true });
}