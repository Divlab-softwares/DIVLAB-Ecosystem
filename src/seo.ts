import { collections } from './data/collections';
import { tools } from './data/tools';
import type { CollectionDefinition, ToolDefinition } from './types';

export const siteUrl = 'https://ecosystem.divlabs-tech.com';
export const siteName = 'DIVLAB Ecosystem';

const toolSearchAliases: Record<string, string[]> = {
  'password-generator': [
    'DIVLAB Password Generator',
    'password generator',
    'generateur de mot de passe',
    'generateur de mon de pass',
    'mot de passe securise',
    'creer un mot de passe fort',
  ],
  'qr-code': ['DIVLAB QR Code Generator', 'generateur QR code', 'qr code gratuit', 'creer un QR code'],
  'json-formatter': ['DIVLAB JSON Formatter', 'json formatter', 'formateur JSON', 'valider JSON', 'beautify JSON'],
  'word-counter': ['DIVLAB Word Counter', 'compteur de mots', 'word counter', 'compter caracteres'],
  'base64': ['base64 encoder decoder', 'encoder base64', 'decoder base64', 'DIVLAB Base64'],
  'image-resize': ['redimensionner image', 'image resizer', 'compresseur image simple'],
  'text-formatter': ['DIVLAB Text Formatter', 'formateur de texte', 'mettre texte en gras', 'changer police texte'],
  'margin-calculator': ['calculateur de marge', 'margin calculator', 'calcul marge commerciale'],
};

function setMeta(name: string, content: string, attribute = 'name') {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = url;
}

function setJsonLd(data: unknown) {
  let element = document.head.querySelector<HTMLScriptElement>('#divlab-jsonld');
  if (!element) {
    element = document.createElement('script');
    element.id = 'divlab-jsonld';
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
}

export function toolPath(tool: ToolDefinition) {
  return `/${tool.collectionId}/${tool.slug}`;
}

export function collectionPath(collection: CollectionDefinition) {
  return `/${collection.id}`;
}

export function getToolSearchAliases(tool: ToolDefinition) {
  return toolSearchAliases[tool.id] ?? [
    `DIVLAB ${tool.name}`,
    tool.name,
    ...tool.keywords,
  ];
}

export function applySeo({
  tool,
  collection,
}: {
  tool: ToolDefinition;
  collection: CollectionDefinition | null;
}) {
  const isHome = !collection;
  const path = isHome ? '/' : toolPath(tool);
  const url = `${siteUrl}${path}`;
  const aliases = getToolSearchAliases(tool);
  const title = isHome
    ? 'DIVLAB Ecosystem - Outils web gratuits, rapides et utiles'
    : `DIVLAB ${tool.name} - ${aliases[1] ?? tool.name}`;
  const description = isHome
    ? 'DIVLAB Ecosystem regroupe des outils web gratuits pour texte, developpement, creation, productivite, etude et business.'
    : `${tool.description} Outil gratuit DIVLAB, rapide, mobile-friendly et utilisable sans compte.`;
  const keywords = [
    'DIVLAB',
    'DIVLAB Ecosystem',
    collection?.name,
    tool.name,
    ...tool.keywords,
    ...aliases,
  ].filter(Boolean).join(', ');

  document.title = title;
  setCanonical(url);
  setMeta('description', description);
  setMeta('keywords', keywords);
  setMeta('robots', 'index, follow, max-image-preview:large');
  setMeta('og:title', title, 'property');
  setMeta('og:description', description, 'property');
  setMeta('og:type', 'website', 'property');
  setMeta('og:url', url, 'property');
  setMeta('og:site_name', siteName, 'property');
  setMeta('og:image', `${siteUrl}/logo.png`, 'property');
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);
  setMeta('twitter:image', `${siteUrl}/logo.png`);

  setJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: isHome ? siteName : `DIVLAB ${tool.name}`,
    alternateName: aliases,
    url,
    applicationCategory: collection ? `${collection.name}Application` : 'UtilitiesApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript. Works in modern browsers.',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'DIVLAB',
      url: 'https://divlabs-tech.com',
      logo: `${siteUrl}/logo.png`,
    },
    potentialAction: {
      '@type': 'UseAction',
      target: url,
      name: `Use ${tool.name}`,
    },
  });
}

export function getSiteStats() {
  return {
    toolCount: tools.length,
    collectionCount: collections.length,
  };
}
