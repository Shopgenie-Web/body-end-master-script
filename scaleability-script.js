(function () {
  function updateViewport() {
    var viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
      );
    }
  }

  // Run the updateViewport function on DOMContentLoaded to catch early changes
  document.addEventListener("DOMContentLoaded", updateViewport);

  // MutationObserver to catch changes that occur after page load
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        updateViewport();
      }
    });
  });

  // Observe the document head for changes
  observer.observe(document.head, { childList: true, subtree: true });
})();
