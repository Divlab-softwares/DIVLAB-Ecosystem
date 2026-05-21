import type { CollectionDefinition } from '../types';

export const collections: CollectionDefinition[] = [
  {
    id: 'text',
    name: 'Text',
    description: 'Formatter, compter, nettoyer et transformer rapidement du texte.',
    accent: '#0b91d2',
  },
  {
    id: 'create',
    name: 'Create',
    description: 'Créer des ressources visuelles simples directement dans le navigateur.',
    accent: '#087fc0',
  },
  {
    id: 'dev',
    name: 'Dev',
    description: 'Convertisseurs et formateurs utiles pour le développement quotidien.',
    accent: '#111111',
  },
  {
    id: 'study',
    name: 'Study',
    description: 'Petits outils pour apprendre, réviser et organiser ses notes.',
    accent: '#118bd1',
  },
  {
    id: 'daily',
    name: 'Daily',
    description: 'Utilitaires pratiques pour les tâches récurrentes de la journée.',
    accent: '#0b6ea8',
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Calculs et générateurs simples pour les usages professionnels.',
    accent: '#222222',
  },
];
