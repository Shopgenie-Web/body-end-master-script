# Duda BodyEnd HTML Master Script
## Script for adding future update scripts

The following script should be loaded into the Body End HTML of a Duda template.  It uses the raw URL of the `script-list.json` to gather the URLs of scripts to load, cycling through the array contained in the .json file.

To add future scripts, create a .js file with the necessary script.  Add it's raw URL to the `script-list.json` list, and that's it!

```
<!-- Place this in the Body End HTML of your Duda website -->
<script id="scriptLoader">
   // Function to load and execute a script from a given URL
  function loadAndExecuteScript(scriptUrl) {
    fetch(scriptUrl)
      .then(response => response.text())
      .then(scriptText => {
        const scriptElement = document.createElement('script');
        scriptElement.type = "application/javascript";
        scriptElement.text = scriptText;
        document.body.appendChild(scriptElement);
      })
      .catch(error => console.error('Error loading script:', error));
  }

  // URL of the JSON file containing the script URLs
  const jsonUrl = 'https://raw.githubusercontent.com/Shopgenie-Web/body-end-master-script/main/script-list.json';

  // Function to fetch and load scripts
  function fetchAndLoadScripts() {
    fetch(jsonUrl)
      .then(response => response.json())
      .then(data => {
        const scriptUrls = data.scripts;
        // Load and execute each script from the JSON file
        scriptUrls.forEach(loadAndExecuteScript);
      })
      .catch(error => console.error('Error loading JSON:', error));
  }

  // Ensure the master script runs after the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", fetchAndLoadScripts);
</script>
```
