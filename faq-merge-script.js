(function () {

  /* ------------ core merge ------------ */
  function mergeFAQSchemas() {
    const existing = document.getElementById('combined-faq-schema');
    const sources  = Array.from(
      document.querySelectorAll(
        'script[type="application/ld+json"]:not([data-faq-processed])'
      )
    ).filter(s => s.id !== 'combined-faq-schema');

    if (!sources.length) return;

    const combined = {
      "@context": "https://schema.org",
      "@type":    "FAQPage",
      mainEntity: []
    };

    sources.forEach(s => {
      try {
        const data  = JSON.parse(s.textContent);
        const nodes = Array.isArray(data?.['@graph']) ? data['@graph'] : [data];

        nodes.forEach(n => {
          if ((n['@type'] || '').toLowerCase() === 'faqpage' &&
              Array.isArray(n.mainEntity)) {
            combined.mainEntity.push(...n.mainEntity);
          }
        });
      } catch (e) {
        console.warn('FAQ JSON‑LD parse error', e);
      }

      s.dataset.faqProcessed = 'y';
      s.remove();
    });

    if (!combined.mainEntity.length) return;

    const out = existing || document.createElement('script');
    out.id    = 'combined-faq-schema';
    out.type  = 'application/ld+json';
    out.text  = JSON.stringify(combined);

    if (!existing) document.head.appendChild(out);
  }

  /* ------------ observer now, not later ------------ */
  const debounced = debounce(mergeFAQSchemas, 150);
  const obs = new MutationObserver(muts => {
    for (const m of muts) {
      if ([...m.addedNodes].some(n =>
           n.nodeType === 1 &&
           n.matches?.('script[type="application/ld+json"]'))) {
        debounced();
        break;
      }
    }
  });

  /* Observe ASAP so blocks inserted during initial render are caught */
  obs.observe(document.documentElement, { childList: true, subtree: true });

  /* One last safety pass at window load */
  window.addEventListener('load', mergeFAQSchemas);

  /* tiny debounce helper */
  function debounce(fn, ms) {
    let t; return () => { clearTimeout(t); t = setTimeout(fn, ms); };
  }
})();
