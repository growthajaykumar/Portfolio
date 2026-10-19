'use client';
import { useState } from 'react';
import H from './H';
import Arrow from './Arrow';
import { text } from '../lib/site';

/** Same behaviour as the original: POST to /api/contact, fall back to the visitor's mail app. */
export default function ContactForm({ form }) {
  const [status, setStatus] = useState('');
  const fields = form.fields.filter((f) => !f.honeypot);
  const trap = form.fields.find((f) => f.honeypot);

  function onSubmit(e) {
    e.preventDefault();
    const el = e.currentTarget;
    if (!el.checkValidity()) { el.reportValidity(); return; }
    const d = new FormData(el);
    const get = (k) => (d.get(k) || '').toString().trim();
    if (get('company_website')) return;
    const body = 'Name: ' + get('name') + '\n' + 'Email: ' + get('email') + '\n' + 'Company: ' + (get('company') || '—') + '\n'
      + 'Industry: ' + get('industry') + '\n' + 'Service: ' + get('service') + '\n' + 'Budget: ' + get('budget') + '\n\n' + get('message');
    const openMail = () => {
      window.location.href = 'mailto:' + form.to + '?subject=' + encodeURIComponent('New enquiry — ' + (get('service') || 'Marketing') + ' — ' + get('name')) + '&body=' + encodeURIComponent(body);
      setStatus(form.messages.fallbackPrefix + form.to + form.messages.fallbackSuffix);
    };
    fetch('/api/contact/', { method: 'POST', body: d })
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then(() => { el.reset(); setStatus(form.messages.sent); })
      .catch(openMail);
  }

  const control = (f) => {
    const common = { id: f.id, name: f.name, required: f.required || undefined, autoComplete: f.autocomplete || undefined };
    if (f.tag === 'select') return <select {...common}>{f.options.map((o) => <option key={o} value={text(o)}>{text(o)}</option>)}</select>;
    if (f.tag === 'textarea') return <textarea {...common} placeholder={f.placeholder ? text(f.placeholder) : undefined} rows={5} />;
    return <input {...common} type={f.type} placeholder={f.placeholder ? text(f.placeholder) : undefined} />;
  };

  return (
    <form className="form" id="contact-form" data-to={form.to} noValidate onSubmit={onSubmit}>
      <div className="form__grid">
        {fields.map((f) => (
          <div key={f.id} className={`field field--${f.tag}${f.name === 'message' ? ' field--wide' : ''}`}>
            <H as="label" htmlFor={f.id} html={f.label} />
            {control(f)}
          </div>
        ))}
      </div>
      {trap && (
        <div className="field field--trap" aria-hidden="true">
          <H as="label" htmlFor={trap.id} html={trap.label} />
          <input id={trap.id} name={trap.name} type="text" tabIndex={-1} autoComplete="off" />
        </div>
      )}
      <div className="form__foot">
        <button className="btn btn--solid" type="submit"><H className="btn__label" html={form.submit} /><Arrow className="btn__arrow" /></button>
        <H as="p" className="form__note" html={form.note} />
      </div>
      <p className="form__status" id="form-status" role="status">{status}</p>
    </form>
  );
}
