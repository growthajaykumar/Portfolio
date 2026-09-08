import nodemailer from 'nodemailer';

function clean(value, maxLength) {
  return String(value || '').replace(/[\r\n]/g, ' ').trim().slice(0, maxLength);
}

export async function POST(request) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: 'Please submit the form again.' }, { status: 400 });
  }

  if (clean(form.get('company_website'), 200)) return Response.json({ ok: true });

  const name = clean(form.get('name'), 120);
  const email = clean(form.get('email'), 200);
  const company = clean(form.get('company'), 160);
  const industry = clean(form.get('industry'), 120);
  const service = clean(form.get('service'), 160);
  const budget = clean(form.get('budget'), 120);
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

  try {
    await transporter.sendMail({
      from: process.env.CONTACT_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_TO || 'ajay@growthwithajay.com',
      replyTo: email,
      subject: `New enquiry from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Company: ${company || 'Not provided'}`,
        `Industry: ${industry || 'Not provided'}`,
        `Service: ${service || 'Not provided'}`,
        `Budget: ${budget || 'Not provided'}`,
        '',
        message
      ].join('\n')
    });
  } catch (error) {
    console.error('Contact email delivery failed', error);
    return Response.json({ error: 'We could not send your message. Please email directly.' }, { status: 502 });
  }

  return Response.json({ ok: true });
}