import type { ComponentType } from 'react';

export type CollectionId = 'text' | 'create' | 'dev' | 'study' | 'daily' | 'business';

export type ToolDefinition = {
  id: string;
  slug: string;
  collectionId: CollectionId;
  name: string;
  description: string;
  keywords: string[];
  component: ComponentType;
};

export type CollectionDefinition = {
  id: CollectionId;
  name: string;
  description: string;
  accent: string;
};
