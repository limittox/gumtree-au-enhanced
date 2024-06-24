function replaceImageUrls() {
    const images = document.getElementsByTagName('img');
    for (let img of images) {
      if (img.src.match(/https:\/\/gumtreeau-res\.cloudinary\.com\/image\/private\/t_\$_s-l800\/gumtree\/.*\.jpg/)) {
        img.src = img.src.replace('t_$_s-l800', 't_$_57');
      }
    }
  }
  
  function removeDfpAdWrapper() {
    const adWrappers = document.getElementsByClassName('vip-ad-gallery__dfp-ad-wrapper');
    for (let wrapper of adWrappers) {
      wrapper.remove();
    }
  }
  
  function adjustGalleryContainers() {
    const swipeContainers = document.querySelectorAll('.vip-ad-gallery__swipe-container');
    const imgWrappers = document.querySelectorAll('.vip-ad-gallery__img-wrapper');
  
    function setWidths() {
      let width = '100%';
      if (window.matchMedia('(min-width: 1440px)').matches) {
        width = '1440px';
      } else if (window.matchMedia('(min-width: 1280px)').matches) {
        width = '1280px';
      } else if (window.matchMedia('(min-width: 768px)').matches) {
        width = '768px';
      }
  
      swipeContainers.forEach(container => {
        container.style.width = width;
      });
  
      imgWrappers.forEach(wrapper => {
        wrapper.style.width = width;
      });
    }
  
    // Initial set
    setWidths();
  
    // Update on window resize
    window.addEventListener('resize', setWidths);
  }
  
  function applyChanges() {
    replaceImageUrls();
    removeDfpAdWrapper();
    adjustGalleryContainers();
  }
  
  // Initial check and application
  chrome.storage.sync.get('enabled', function(data) {
    if (data.enabled) {
      applyChanges();
    }
  });
  
  // Listen for changes in extension state
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "toggle") {
      if (request.enabled) {
        applyChanges();
      } else {
        location.reload();
      }
    }
  });
  
  // Observe DOM changes to handle dynamically loaded content
  const observer = new MutationObserver(function(mutations) {
    chrome.storage.sync.get('enabled', function(data) {
      if (data.enabled) {
        applyChanges();
      }
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });