import { notFound } from 'next/navigation';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const routes = {
  '': 'index.html',
  about: 'about/index.html',
  contact: 'contact/index.html',
  services: 'services/index.html',
  work: 'work/index.html',
  'services/brand-building': 'services/brand-building/index.html',
  'services/growth-marketing': 'services/growth-marketing/index.html',
  'services/marketing-automation': 'services/marketing-automation/index.html',
  'services/paid-ads': 'services/paid-ads/index.html',
  'services/seo': 'services/seo/index.html'
};

function decodeMetadata(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&middot;/g, '·')
    .replace(/&rsquo;/g, '’')
    .replace(/&ldquo;|&rdquo;/g, '"');
}

function readPage(route) {
  const source = routes[route];
  if (!source) return null;

  const html = fs.readFileSync(path.join(root, source), 'utf8');
  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';

  return {
    title: decodeMetadata(head.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || 'Growth with Ajay'),
    description: decodeMetadata(head.match(/<meta name="description" content="([^"]*)"/i)?.[1] || ''),
    body: body.replace(/<script[^>]+src=["'][^"']*main\.js[^"']*["'][^>]*><\/script>/gi, '')
  };
}

export async function generateMetadata({ params }) {
  const { slug = [] } = await params;
  const page = readPage(slug.join('/'));
  if (!page) return {};

  return { title: page.title, description: page.description };
}

export default async function Page({ params }) {
  const { slug = [] } = await params;
  const page = readPage(slug.join('/'));
  if (!page) notFound();

  return <div dangerouslySetInnerHTML={{ __html: page.body }} />;
}