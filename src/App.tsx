import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from 'react';
import { collections } from './data/collections';
import { tools } from './data/tools';
import { applySeo, collectionPath, getSiteStats, getToolSearchAliases, siteUrl, toolPath } from './seo';
import type { CollectionId, ToolDefinition } from './types';

type RouteState = {
  collectionId: CollectionId | null;
  toolSlug: string | null;
};

function readRoute(): RouteState {
  const redirectedPath = new URLSearchParams(window.location.search).get('p');
  if (redirectedPath) {
    window.history.replaceState({}, '', redirectedPath);
  }

  const parts = window.location.pathname
    .split('/')
    .map((part) => decodeURIComponent(part).trim())
    .filter(Boolean);

  const collection = collections.find((item) => item.id.toLowerCase() === parts[0]?.toLowerCase());
  return {
    collectionId: collection?.id ?? null,
    toolSlug: parts[1] ?? null,
  };
}

export function App() {
  const [route, setRoute] = useState<RouteState>(() => readRoute());
  const [query, setQuery] = useState('');
  const [isHome, setIsHome] = useState(() => !window.location.pathname.split('/').filter(Boolean).length);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('divlab-theme') === 'dark');

  useEffect(() => {
    const syncRoute = () => setRoute(readRoute());
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  const activeCollection = route.collectionId
    ? collections.find((collection) => collection.id === route.collectionId) ?? null
    : null;

  const routeTools = route.collectionId ? tools.filter((tool) => tool.collectionId === route.collectionId) : tools;

  const activeTool =
    routeTools.find((tool) => tool.slug.toLowerCase() === route.toolSlug?.toLowerCase()) ??
    routeTools[0] ??
    tools[0];

  const ActiveTool = activeTool.component;
  const stats = getSiteStats();

  useEffect(() => {
    applySeo({ tool: activeTool, collection: activeCollection });
  }, [activeCollection, activeTool]);

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return routeTools.filter((tool) => {
      const haystack = `${tool.name} ${tool.description} ${tool.keywords.join(' ')}`.toLowerCase();
      return !normalizedQuery || haystack.includes(normalizedQuery);
    });
  }, [query, routeTools]);

  function navigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    window.history.pushState({}, '', href);
    setRoute(readRoute());
    if(href === '/') {
      setIsHome(true);
    } else {
      setIsHome(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleTheme() {
    setIsDark((current) => {
      localStorage.setItem('divlab-theme', current ? 'light' : 'dark');
      return !current;
    });
  }

  return (
    <div className="app" data-theme={isDark ? 'dark' : 'light'}>
      <header className="shell app-header">
        <nav className="topbar" aria-label="Navigation principale">
          <a className="brand" href="/" onClick={(event) => navigate(event, '/')} aria-label="Retour a la page mere DIVLAB">
            <span className="brand-mark">
              <img src="/logo.png" alt="Logo DIVLAB" />
            </span>
            <span>
              <strong>DIVLAB</strong>
              <small>Ecosystem</small>
            </span>
          </a>
          <div className="topbar-actions">
            <a className="subtle-link" href="/" onClick={(event) => navigate(event, '/')}>
              Tous les outils
            </a>
            <button className="ghost-button" type="button" onClick={toggleTheme}>
              {isDark ? 'Mode clair' : 'Mode sombre'}
            </button>
          </div>
        </nav>

        <div className="context-strip" aria-label="Contexte de la page">
          <span>{activeCollection ? `Collection ${activeCollection.name}` : 'Page mere DIVLAB'}</span>
          <span>{activeTool.name}</span>
          <span>Fonctionne localement dans le navigateur</span>
        </div>
      </header>

      <main className="shell layout">
        <aside className="sidebar" aria-label="Navigation des collections">
          <div className="section-title">
            <span>Collections</span>
            <small>Choisir une page</small>
          </div>
          <a className={!activeCollection ? 'nav-item active' : 'nav-item'} href="/" onClick={(event) => {navigate(event, '/')}}>
            <span>Maison mere</span>
            <small>{tools.length}</small>
          </a>
          {collections.map((collection) => (
            <a
              className={activeCollection?.id === collection.id ? 'nav-item active' : 'nav-item'}
              style={{ '--accent': collection.accent } as CSSProperties}
              href={collectionPath(collection)}
              key={collection.id}
              onClick={(event) => navigate(event, collectionPath(collection))}
            >
              <span>{collection.name}</span>
              <small>{tools.filter((tool) => tool.collectionId === collection.id).length}</small>
            </a>
          ))}
        </aside>

        <section className="workspace" aria-label="Outil principal DIVLAB">
          {!isHome ? (
            <article className="tool-surface primary-tool">
              <div className="tool-heading">
                <div>
                  <p className="eyebrow">{activeCollection?.name ?? 'DIVLAB Ecosystem'}</p>
                  <h1>{activeTool.name}</h1>
                </div>
              <p>{activeTool.description}</p>
            </div>
            <ActiveTool />
            <div className="seo-keywords" aria-label="Recherches associees">
              <span>Recherches associees</span>
              {getToolSearchAliases(activeTool).slice(0, 6).map((alias) => (
                <a href={toolPath(activeTool)} key={alias} onClick={(event) => navigate(event, toolPath(activeTool))}>
                  {alias}
                </a>
              ))}
            </div>
          </article> ): (
            <div/>
            )}


          <section className="below-tool" aria-label="Explorer les autres outils">
            <div className="toolbar">
              <div>
                <p className="eyebrow">Explorer</p>
                <h2>{activeCollection ? `Autres outils ${activeCollection.name}` : 'Collections et outils disponibles'}</h2>
              </div>
              <label className="search">
                <span>Filtrer les raccourcis</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="JSON, texte, marge..."
                />
              </label>
            </div>

            {!activeCollection && (
              <div className="collection-grid" aria-label="Pages de collections">
                {collections.map((collection) => (
                  <a
                    className="collection-card"
                    style={{ '--accent': collection.accent } as CSSProperties}
                    href={collectionPath(collection)}
                    key={collection.id}
                    onClick={(event) => navigate(event, collectionPath(collection))}
                  >
                    <strong>{collection.name}</strong>
                    <span>{collection.description}</span>
                  </a>
                ))}
              </div>
            )}

            <ToolLinks tools={filteredTools} activeToolId={activeTool.id} onNavigate={navigate} />
          </section>
        </section>
      </main>

      <footer className="shell site-footer" aria-label="Contacts professionnels DIVLAB">
        <div>
          <strong>DIVLAB Ecosystem</strong>
          <span>{stats.toolCount} outils web dans {stats.collectionCount} collections, optimises pour un usage rapide.</span>
          <span>Made by DIVLAB | all rights reserved | 2026</span>
        </div>
          <address>
          <a href="https://wa.me/237652509674" target="_blank" rel="noopener noreferrer">+237 652 50 96 74</a>
          <a href="mailto:divlabsoftware@gmail.com">divlabsoftware@gmail.com</a>
          <a href="https://divlabs-tech.com">divlabs-tech.com</a>
          <a href={siteUrl}>ecosystem.divlabs-tech.com</a>
        </address>
      </footer>
    </div>
  );
}

function ToolLinks({
  tools: visibleTools,
  activeToolId,
  onNavigate,
}: {
  tools: ToolDefinition[];
  activeToolId: string;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  if (!visibleTools.length) {
    return <div className="empty-state">Aucun outil ne correspond a cette recherche.</div>;
  }

  return (
    <div className="tool-grid compact">
      {visibleTools.map((tool) => (
        <a
          className={activeToolId === tool.id ? 'tool-card active' : 'tool-card'}
          href={toolPath(tool)}
          key={tool.id}
          onClick={(event) => onNavigate(event, toolPath(tool))}
        >
          <strong>{tool.name}</strong>
          <span>{tool.description}</span>
        </a>
      ))}
    </div>
  );
}
