function replaceImageUrls() {
    const images = document.getElementsByTagName('img');
    for (let img of images) {
      if (img.src.match(/https:\/\/gumtreeau-res\.cloudinary\.com\/image\/private\/t_\$_s-l800\/gumtree\/.*\.jpg/)) {
        img.src = img.src.replace('t_$_s-l800', 't_$_57');
      }
    }
  }
  
function handleDfpAdWrappers() {
  // Create a style element to hide the ad wrappers
  const style = document.createElement('style');
  style.textContent = '.vip-ad-gallery__dfp-ad-wrapper { display: none !important; }';
  document.head.appendChild(style);

  // Function to hide existing ad wrappers
  function hideExistingAdWrappers() {
    const adWrappers = document.getElementsByClassName('vip-ad-gallery__dfp-ad-wrapper');
    for (let wrapper of adWrappers) {
      wrapper.style.setProperty('display', 'none', 'important');
    }
  }

  // Hide any existing ad wrappers
  hideExistingAdWrappers();

  // Set up a MutationObserver to watch for new ad wrappers
  // const observer = new MutationObserver((mutations) => {
  //   for (let mutation of mutations) {
  //     if (mutation.type === 'childList') {
  //       for (let node of mutation.addedNodes) {
  //         if (node.nodeType === Node.ELEMENT_NODE) {
  //           if (node.classList.contains('vip-ad-gallery__dfp-ad-wrapper')) {
  //             node.style.setProperty('display', 'none', 'important');
  //           } else {
  //             const adWrappers = node.getElementsByClassName('vip-ad-gallery__dfp-ad-wrapper');
  //             for (let wrapper of adWrappers) {
  //               wrapper.style.setProperty('display', 'none', 'important');
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // });

  // // Start observing the entire document
  // observer.observe(document.body, { childList: true, subtree: true });

  console.log('Ad wrapper handler set up successfully');
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

function adjustGalleryNavigation() {
  console.log('adjustGalleryNavigation function called');
  
  const nextButton = document.querySelector('[class*="vip-ad-gallery__nav-btn--next"]');
  const imgContainer = document.querySelector('.vip-ad-gallery__img-container');

  if (!imgContainer || !(imgContainer instanceof Node)) {
    console.error('Image container not found or not a valid DOM node');
    return;
  }

  if (!nextButton) {
    console.error('Next button not found');
    return;
  }

  let currentIndex = 0;

  function applyTranslation() {
    currentIndex++;
    let translationAmount;
    if (window.matchMedia('(min-width: 1440px)').matches) {
      translationAmount = -1440;
    } else if (window.matchMedia('(min-width: 1280px)').matches) {
      translationAmount = -1280;
    } else if (window.matchMedia('(min-width: 768px)').matches) {
      translationAmount = -768;
    } else {
      console.log('Viewport width below 768px, no modification');
      return;  // Don't modify if below 768px
    }

    const newTranslation = translationAmount * currentIndex;

    console.log('Current index:', currentIndex);
    console.log('Translation amount:', translationAmount);
    console.log('New translation:', newTranslation);
    
    imgContainer.style.transform = `translateX(${newTranslation}px)`;
    console.log('Applied new translation:', newTranslation);
  }

  if (!nextButton.hasEventListener) {
    nextButton.addEventListener('click', () => {
      console.log('The next button is clicked');
      setTimeout(applyTranslation, 500);
      // applyTranslation();
    });
    nextButton.hasEventListener = true;
  }

  // Optional: Keep the observer to log changes
  const observer = new MutationObserver((mutations) => {
    console.log('Style mutation detected');
  });

  try {
    observer.observe(imgContainer, { attributes: true, attributeFilter: ['style'] });
    console.log('Successfully set up observer on image container');
  } catch (error) {
    console.error('Error setting up observer:', error);
  }
}

function waitForElement(selector, callback) {
  const element = document.querySelector(selector);
  if(element) {
    callback(element);
  } else {
    setTimeout(() => waitForElement(selector, callback), 500);
  }
}
  function applyChanges() {
    replaceImageUrls();
    handleDfpAdWrappers();
    adjustGalleryContainers();
    waitForElement('.vip-ad-gallery__img-container', () => {
      adjustGalleryNavigation();
    });
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