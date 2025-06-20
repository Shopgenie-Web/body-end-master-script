document.addEventListener("DOMContentLoaded", function () {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  let combinedFAQSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [],
  };

  scripts.forEach((script) => {
    try {
      const schema = JSON.parse(script.textContent);
      if (schema["@type"] === "FAQPage" && Array.isArray(schema.mainEntity)) {
        combinedFAQSchema.mainEntity = combinedFAQSchema.mainEntity.concat(schema.mainEntity);
        script.remove();
      }
    } catch (e) {
      console.warn("FAQ schema parse failed", e);
    }
  });

  if (combinedFAQSchema.mainEntity.length > 0) {
    const newScript = document.createElement("script");
    newScript.type = "application/ld+json";
    newScript.text = JSON.stringify(combinedFAQSchema);
    document.head.appendChild(newScript);
  }
});

