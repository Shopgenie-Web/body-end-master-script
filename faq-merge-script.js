(function () {

  /* ---------- core merge routine ---------- */
  function mergeFAQSchemas() {
    const existingCombo = document.getElementById('combined-faq-schema');
    const sourceScripts = Array.from(
      document.querySelectorAll(
        'script[type="application/ld+json"]:not([data-faq-processed])'
      )
    ).filter(s => s.id !== 'combined-faq-schema');   // ignore our own output

    if (!sourceScripts.length) return;               // nothing new to do

    const combined = {
      "@context": "https://schema.org",
      "@type"   : "FAQPage",
      mainEntity: []
    };

    sourceScripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);

        /* Normalise possible structures: direct object or @graph array */
        const nodes = Array.isArray(data?.['@graph']) ? data['@graph'] : [data];

        nodes.forEach(node => {
          const type = (node['@type'] || '').toLowerCase();
          if (type === 'faqpage' && Array.isArray(node.mainEntity)) {
            combined.mainEntity.push(...node.mainEntity);
          }
        });

      } catch (e) {
        console.warn('Bad FAQ JSON‑LD skipped →', e);
      }

      /* Mark this script so we don't process it again */
      script.dataset.faqProcessed = 'true';
      /* Leave it in place until after we safely parse it, then remove */
      script.remove();
    });

    if (!combined.mainEntity.length) return;         // nothing valid was found

    /* Update existing combo node or add a new one */
    const target = existingCombo || document.createElement('script');
    target.type  = 'application/ld+json';
    target.id    = 'combined-faq-schema';
    target.text  = JSON.stringify(combined);

    if (!existingCombo) document.head.appendChild(target);
  }


  /* ---------- run once after full load ---------- */
  window.addEventListener('load', () => {
    mergeFAQSchemas();

    /* ---------- watch for late‑injected FAQ scripts ---------- */
    const debouncedMerge = debounce(mergeFAQSchemas, 250);
    const observer = new MutationObserver(muts => {
      for (const m of muts) {
        if ([...m.addedNodes].some(n =>
              n.nodeType === 1 &&
              n.matches?.('script[type="application/ld+json"]')
            )) {
          debouncedMerge();
          break;
        }
      }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
  });


  /* ---------- simple debounce helper ---------- */
  function debounce(fn, wait) {
    let t; return () => { clearTimeout(t); t = setTimeout(fn, wait); };
  }

})();
