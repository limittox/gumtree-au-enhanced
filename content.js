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

  console.log('Ad wrapper handler set up successfully');
}

function createCustomCarousel() {
  console.log('Creating custom carousel');

  // Find the original carousel container
  const originalCarousel = document.querySelector('.vip-ad-gallery__swipe-container');
  if (!originalCarousel) {
    console.error('Original carousel not found');
    return;
  }

  const originalCarouselThumbnails = document.querySelector('.vip-ad-gallery-thumbnails__list');
  if (!originalCarouselThumbnails) {
    console.error('Original carousel thumbnails not found');
    return;
  }

  // Extract all the image URLs from the original carousel thumbnails
  const imageUrls = Array.from(originalCarouselThumbnails.querySelectorAll('div'))
    .map(div => div.style.backgroundImage)
    .map(url => url.match(/url\("([^"]+)"\)/)[1])
    .filter(src => src.includes('gumtreeau-res.cloudinary.com'));
  console.log(imageUrls);

  // Create our custom carousel structure
  const customCarousel = document.createElement('div');
  customCarousel.className = 'custom-carousel';
  customCarousel.style.cssText = `
    width: 80%;
    height: 80%;
    display: block;
    margin-left: auto;
    margin-right: auto;
    overflow: hidden;
    position: relative;
  `;

  const imageContainer = document.createElement('div');
  imageContainer.className = 'custom-carousel-container';
  imageContainer.style.cssText = `
    display: flex;
    transition: transform 0.3s ease;
  `;

  imageUrls.forEach((url, index) => {
    const img = document.createElement('img');
    img.src = url.replace('t_$_s-l135', 't_$_57');
    img.style.cssText = `
      width: 100%;
      flex-shrink: 0;
    `;
    imageContainer.appendChild(img);
  });

  customCarousel.appendChild(imageContainer);

  // Add navigation buttons
  const prevButton = document.createElement('button');
  prevButton.textContent = '←';
  prevButton.className = 'custom-carousel-nav prev';
  const nextButton = document.createElement('button');
  nextButton.textContent = '→';
  nextButton.className = 'custom-carousel-nav next';

  const navButtonStyle = `
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0,0,0,0.5);
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
  `;
  prevButton.style.cssText = navButtonStyle + 'left: 10px;';
  nextButton.style.cssText = navButtonStyle + 'right: 10px;';

  customCarousel.appendChild(prevButton);
  customCarousel.appendChild(nextButton);

  // Replace the original carousel with our custom one
  originalCarousel.parentNode.replaceChild(customCarousel, originalCarousel);

  // Implement navigation functionality
  let currentIndex = 0;

  function updateCarousel() {
    const width = customCarousel.offsetWidth;
    imageContainer.style.transform = `translateX(${-currentIndex * width}px)`;
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % imageUrls.length;
    updateCarousel();
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + imageUrls.length) % imageUrls.length;
    updateCarousel();
  }

  nextButton.addEventListener('click', nextImage);
  prevButton.addEventListener('click', prevImage);

  // Initial update
  updateCarousel();

  // Adjust carousel on window resize
  window.addEventListener('resize', updateCarousel);

  console.log('Custom carousel created successfully');

  removeOldCarouselElements();

  console.log('Old carousel elements removed successfully');
}

function removeOldCarouselElements() {
  const nextButton = document.querySelector('[class*="vip-ad-gallery__nav-btn--next"]');
  nextButton.style.setProperty('display', 'none', 'important');
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
    waitForElement('.vip-ad-gallery__swipe-container', () => {
      createCustomCarousel();
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