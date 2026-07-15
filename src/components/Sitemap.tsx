import React, { useEffect } from 'react';
import { ChevronLeft, Cpu, Globe, ExternalLink } from 'lucide-react';
import './Sitemap.css';

interface SitemapProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
}

const Sitemap: React.FC<SitemapProps> = ({ onBack, onNavigate }) => {
  useEffect(() => {
    const SCHEMA_ID = 'sitemap-breadcrumb-jsonld';
    const existingScript = document.getElementById(SCHEMA_ID);
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.id = SCHEMA_ID;
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Kone AI",
          "item": "https://ai.koneacademy.io/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Sitemap",
          "item": "https://ai.koneacademy.io/"
        }
      ]
    });
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(SCHEMA_ID);
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, []);

  return (
    <div className="ai-sitemap-page">
      {/* Header action bar */}
      <div className="ai-sitemap-header">
        <button onClick={onBack} className="ai-sitemap-back-btn">
          <ChevronLeft size={18} /> Back
        </button>
        <span className="ai-sitemap-brand">Kone AI Index</span>
      </div>

      <div className="ai-sitemap-container">
        <div className="ai-sitemap-card">
          <h1 className="ai-sitemap-title">Kone AI Sitemap</h1>
          <p className="ai-sitemap-subtitle">
            Local platform index for agentic LLM workflows, automated repository analysis, and clinical science data synthesis pipelines.
          </p>

          <div className="ai-sitemap-grid">
            {/* Column 1: Core AI Modules */}
            <div className="ai-sitemap-column">
              <div className="ai-sitemap-col-header">
                <Cpu className="ai-sitemap-icon" size={20} />
                <h2>Platform Modules</h2>
              </div>
              <div className="ai-sitemap-list">
                <div className="ai-sitemap-item">
                  <button onClick={() => onNavigate('synthesis')} className="ai-sitemap-btn-link">
                    Synthesis Simulator
                  </button>
                  <p className="ai-sitemap-desc">Agentic LLM task orchestration console for executing complex automated code synthesis and workflows.</p>
                </div>
                <div className="ai-sitemap-item">
                  <button onClick={() => onNavigate('knowledge')} className="ai-sitemap-btn-link">
                    Knowledge Base
                  </button>
                  <p className="ai-sitemap-desc">Central AI repository for loading hardware schematics, research papers, and domain logic.</p>
                </div>
                <div className="ai-sitemap-item">
                  <button onClick={() => onNavigate('settings')} className="ai-sitemap-btn-link">
                    Lab Settings
                  </button>
                  <p className="ai-sitemap-desc">Configure LLM model temperature, API keys, hardware offsets, and guardrails.</p>
                </div>
              </div>
            </div>

            {/* Column 2: Ecosystem Indexes */}
            <div className="ai-sitemap-column">
              <div className="ai-sitemap-col-header">
                <Globe className="ai-sitemap-icon" size={20} />
                <h2>Ecosystem Indexes</h2>
              </div>
              <div className="ai-sitemap-list">
                <div className="ai-sitemap-item">
                  <a href="https://www.koneacademy.io" className="ai-sitemap-link" target="_blank" rel="noopener noreferrer">
                    Kone Academy Main Hub <ExternalLink size={12} className="ai-external-icon" />
                  </a>
                  <p className="ai-sitemap-desc">Parent company landing page containing central index protocols and specs.</p>
                </div>
                <div className="ai-sitemap-item">
                  <a href="https://www.koneacademy.io/sitemap" className="ai-sitemap-link" target="_blank" rel="noopener noreferrer">
                    Central Sitemap Hub <ExternalLink size={12} className="ai-external-icon" />
                  </a>
                  <p className="ai-sitemap-desc">Central link directory connecting all 11 subdomains.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
