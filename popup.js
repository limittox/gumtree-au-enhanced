document.addEventListener('DOMContentLoaded', async function() {
    try {
      var toggleSwitch = document.getElementById('toggleSwitch');
      
      const data = await chrome.storage.sync.get('enabled');
      toggleSwitch.checked = data.enabled;
  
      toggleSwitch.addEventListener('change', async function() {
        await chrome.storage.sync.set({enabled: this.checked});
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        await chrome.tabs.sendMessage(tab.id, {action: "toggle", enabled: toggleSwitch.checked});
      });
    } catch (error) {
      console.error('An error occurred:', error);
    }
  });