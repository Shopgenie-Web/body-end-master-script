(function () {
  // Check if the current pathname is the home page "/"
  if (window.location.pathname === "/") {
    // Function to find all FAQ schema scripts and merge them
    function mergeFAQSchemas() {
      // Get all script tags with type "application/ld+json"
      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      );
      let combinedFAQSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [],
      };

      // Loop through each script tag
      scripts.forEach((script) => {
        try {
          const schema = JSON.parse(script.innerText);

          // Check if the script contains FAQPage schema
          if (
            schema["@type"] === "FAQPage" &&
            Array.isArray(schema.mainEntity)
          ) {
            // Merge mainEntity arrays
            combinedFAQSchema.mainEntity = combinedFAQSchema.mainEntity.concat(
              schema.mainEntity
            );
            // Remove the original script tag to avoid duplicates
            script.remove();
          }
        } catch (e) {
          console.error("Failed to parse schema JSON:", e);
        }
      });

      // Create a new script tag for the combined FAQ schema
      const newScript = document.createElement("script");
      newScript.type = "application/ld+json";
      newScript.text = JSON.stringify(combinedFAQSchema);
      document.head.appendChild(newScript);
    }

    // Execute the merging function
    mergeFAQSchemas();
  }
})();
