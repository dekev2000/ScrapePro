<template>
  <div
    class="fullscreen-preview"
    ref="previewContainer"
    tabindex="0"
    @keydown.esc="closePreview"
  >
    <div
      class="loading-overlay"
      v-if="isLoading"
    >
      <div class="spinner"></div>
      <div class="loading-text">Loading preview...</div>
    </div>

    <div
      class="esc-hint"
      v-if="!isLoading"
    >
      Press <kbd>ESC</kbd> to return
    </div>

    <iframe
      :src="previewUrl"
      class="fullscreen-iframe"
      ref="previewFrame"
      @load="onIframeLoad"
      title="Website Preview"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "@/composables/useToast";
import html2canvas from "html2canvas";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const previewUrl = ref("");
const previewFrame = ref<HTMLIFrameElement | null>(null);
const previewContainer = ref<HTMLElement | null>(null);
const isLoading = ref(true);
const isCapturing = ref(false);

// Get URL from route query parameter
onMounted(() => {
  previewUrl.value = (route.query.url as string) || "";

  // If no URL provided, go back
  if (!previewUrl.value) {
    toast.error("No preview URL provided");
    router.back();
  }

  // Listen for messages from parent
  window.addEventListener("message", handleMessage);

  // Prevent scrolling on body
  document.body.style.overflow = "hidden";

  // Set focus to container to enable keyboard events
  setTimeout(() => {
    if (previewContainer.value) {
      previewContainer.value.focus();
    }
  }, 100);

  // Add global event listener for ESC key
  document.addEventListener("keydown", handleKeyDown);
});

// Handle keyboard events
const handleKeyDown = (event: KeyboardEvent) => {
  // Close preview when ESC key is pressed
  if (event.key === "Escape") {
    closePreview();
  }
};

onBeforeUnmount(() => {
  // Clean up
  window.removeEventListener("message", handleMessage);
  document.removeEventListener("keydown", handleKeyDown);
  document.body.style.overflow = "";
});

// Handle messages from parent window
const handleMessage = (event: MessageEvent) => {
  if (event.data.type === "CAPTURE_SCREENSHOT") {
    captureScreenshot();
  } else if (event.data.type === "CLOSE_PREVIEW") {
    closePreview();
  }
};

// When iframe is loaded
const onIframeLoad = () => {
  isLoading.value = false;

  // Remove DeepSite watermark immediately
  removeDeepSiteWatermark();

  // Apply watermark removal again after a delay to catch any dynamically added watermarks
  setTimeout(removeDeepSiteWatermark, 1000);
  setTimeout(removeDeepSiteWatermark, 3000);

  // Set up an interval to periodically check for and remove watermarks
  const watermarkRemovalInterval = setInterval(removeDeepSiteWatermark, 2000);

  // Add direct CSS to the parent document to hide watermarks in iframes
  const style = document.createElement("style");
  style.textContent = `
    iframe {
      position: relative;
    }

    iframe::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 300px;
      height: 50px;
      background-color: transparent;
      z-index: 9999;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  // Clean up interval when component is unmounted
  onBeforeUnmount(() => {
    clearInterval(watermarkRemovalInterval);
    document.head.removeChild(style);
  });
};

// Function to remove DeepSite watermark
const removeDeepSiteWatermark = () => {
  try {
    const iframe = previewFrame.value;
    if (!iframe) return;

    const iframeDocument =
      iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDocument) {
      console.error(
        "Cannot access iframe content due to cross-origin restrictions"
      );
      return;
    }

    // Target the exact watermark we know exists
    const exactWatermarkSelector =
      'p[style*="border-radius: 8px"][style*="text-align: center"][style*="position: fixed"][style*="left: 8px"][style*="bottom: 8px"]';
    const exactWatermark = iframeDocument.querySelector(exactWatermarkSelector);

    if (exactWatermark) {
      console.log("Found exact watermark, removing it directly");
      exactWatermark.remove();
    }

    // Add CSS to hide all watermarks - more aggressive approach
    const style = iframeDocument.createElement("style");
    style.textContent = `
      /* Direct targeting of the exact watermark */
      p[style*="border-radius: 8px"][style*="text-align: center"][style*="position: fixed"][style*="left: 8px"][style*="bottom: 8px"],
      p[style*="Made with"][style*="position: fixed"],
      p:has(img[src*="logo.svg"]),
      p:has(a[href*="deepsite"]),
      p:has(a[href*="remix"]) {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        z-index: -9999 !important;
      }

      /* Hide elements with specific attributes that match the watermark */
      [style*="position: fixed"][style*="bottom: 8px"][style*="left: 8px"],
      [style*="position: fixed"][style*="z-index: 10"][style*="bottom: 8px"],
      [style*="border-radius: 8px"][style*="text-align: center"][style*="position: fixed"],
      [style*="background: rgba(0, 0, 0, 0.8)"][style*="position: fixed"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        z-index: -9999 !important;
      }

      /* Hide specific elements related to DeepSite */
      a[href*="deepsite"],
      a[href*="enzostvs"],
      a[href*="remix"],
      img[src*="logo.svg"],
      img[alt*="DeepSite"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }

      /* Create a blocking overlay at the bottom left corner */
      body::after {
        content: "";
        position: fixed;
        bottom: 0;
        left: 0;
        width: 300px;
        height: 50px;
        background-color: inherit;
        background-image: linear-gradient(to top, currentColor, transparent);
        opacity: 0.95;
        z-index: 9999;
      }
    `;
    iframeDocument.head.appendChild(style);

    // Execute JavaScript to remove watermarks
    const removeWatermarksScript = iframeDocument.createElement("script");
    removeWatermarksScript.textContent = `
      // Function to remove watermarks
      function removeWatermarks() {
        // Target the exact watermark we know exists
        const exactWatermarkSelector = 'p[style*="border-radius: 8px"][style*="text-align: center"][style*="position: fixed"][style*="left: 8px"][style*="bottom: 8px"]';
        const exactWatermark = document.querySelector(exactWatermarkSelector);

        if (exactWatermark) {
          console.log('Found exact watermark match, removing it');
          exactWatermark.remove();

          // Create a blocking element to cover the area
          const blocker = document.createElement('div');
          blocker.style.position = 'fixed';
          blocker.style.bottom = '0';
          blocker.style.left = '0';
          blocker.style.width = '300px';
          blocker.style.height = '50px';
          blocker.style.backgroundColor = 'white';
          blocker.style.zIndex = '9999';
          document.body.appendChild(blocker);
        }

        // Look for paragraphs with specific content
        document.querySelectorAll('p').forEach(p => {
          const html = p.innerHTML.toLowerCase();
          const style = p.getAttribute('style') || '';

          if (
            (html.includes('made with') && html.includes('deepsite')) ||
            (html.includes('logo.svg')) ||
            (html.includes('remix')) ||
            (style.includes('position: fixed') && style.includes('bottom: 8px'))
          ) {
            console.log('Found watermark paragraph, removing it');
            p.remove();
          }
        });

        // Remove all elements with specific attributes
        document.querySelectorAll('[style*="position: fixed"][style*="bottom: 8px"]').forEach(el => {
          console.log('Removing fixed positioned element at bottom');
          el.remove();
        });

        // Remove all links to DeepSite
        document.querySelectorAll('a[href*="deepsite"], a[href*="enzostvs"], a[href*="remix"]').forEach(el => {
          console.log('Removing DeepSite link');
          el.remove();
        });

        // Remove all DeepSite logo images
        document.querySelectorAll('img[src*="logo.svg"], img[alt*="DeepSite"]').forEach(el => {
          console.log('Removing DeepSite logo');
          el.remove();
        });

        // Create an overlay at the bottom left that matches the page background
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.bottom = '0';
        overlay.style.left = '0';
        overlay.style.width = '300px';
        overlay.style.height = '50px';

        // Try to get the background color of the page
        const bgColor = window.getComputedStyle(document.body).backgroundColor;
        overlay.style.backgroundColor = bgColor !== 'rgba(0, 0, 0, 0)' ? bgColor : 'white';

        // Add a subtle gradient to blend better
        overlay.style.backgroundImage = 'linear-gradient(to top, ' + overlay.style.backgroundColor + ', transparent)';
        overlay.style.zIndex = '9999';
        document.body.appendChild(overlay);

        // Add a class for easier identification
        overlay.className = 'watermark-blocker';
      }

      // Function to detect the best color for the overlay
      function detectOverlayColor() {
        // Try to get the background color of the bottom area
        const bottomElements = Array.from(document.elementsFromPoint(150, window.innerHeight - 10));
        let bgColor = 'white';

        // Try to find a suitable background color
        for (const el of bottomElements) {
          const style = window.getComputedStyle(el);
          const elBgColor = style.backgroundColor;

          if (elBgColor && elBgColor !== 'rgba(0, 0, 0, 0)' && elBgColor !== 'transparent') {
            bgColor = elBgColor;
            break;
          }
        }

        // Update all watermark blockers
        document.querySelectorAll('.watermark-blocker').forEach(blocker => {
          blocker.style.backgroundColor = bgColor;
        });

        return bgColor;
      }

      // Run immediately
      removeWatermarks();

      // Run again after a delay to catch dynamically added watermarks
      setTimeout(removeWatermarks, 1000);
      setTimeout(() => {
        removeWatermarks();
        detectOverlayColor();
      }, 3000);

      // Monitor for changes and remove watermarks
      const observer = new MutationObserver(function(mutations) {
        removeWatermarks();
        detectOverlayColor();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    `;
    iframeDocument.body.appendChild(removeWatermarksScript);

    // Look for the watermark by its specific style and content - more specific selectors
    const watermarks = iframeDocument.querySelectorAll(
      'p[style*="position: fixed"][style*="bottom: 8px"], ' +
        'p[style*="position: fixed"][style*="z-index: 10"], ' +
        'p[style*="border-radius: 8px"][style*="position: fixed"], ' +
        'p[style*="text-align: center"][style*="position: fixed"], ' +
        'div[style*="position: fixed"][style*="bottom"], ' +
        'div[style*="position: absolute"][style*="bottom"]'
    );

    // Also look for any elements containing the DeepSite logo or text - more comprehensive
    const possibleWatermarks = Array.from(
      iframeDocument.querySelectorAll("p, div, a, span, img")
    ).filter((el) => {
      // Check innerHTML
      const content = el.innerHTML ? el.innerHTML.toLowerCase() : "";

      // Check for image sources
      const imgSrc =
        el.tagName === "IMG" && el.getAttribute("src")
          ? el.getAttribute("src").toLowerCase()
          : "";

      // Check for image alt text
      const imgAlt =
        el.tagName === "IMG" && el.getAttribute("alt")
          ? el.getAttribute("alt").toLowerCase()
          : "";

      // Check href attributes
      const href = el.getAttribute("href")
        ? el.getAttribute("href").toLowerCase()
        : "";

      // Check style attributes
      const style = el.getAttribute("style")
        ? el.getAttribute("style").toLowerCase()
        : "";

      return (
        content.includes("deepsite") ||
        content.includes("hugging face") ||
        content.includes("huggingface") ||
        content.includes("enzostvs") ||
        content.includes("static.hf.space") ||
        content.includes("remix") ||
        content.includes("logo.svg") ||
        content.includes("made with") ||
        content.includes("powered by") ||
        imgSrc.includes("logo.svg") ||
        imgSrc.includes("deepsite") ||
        imgAlt.includes("deepsite") ||
        href.includes("huggingface") ||
        href.includes("deepsite") ||
        href.includes("enzostvs") ||
        href.includes("remix") ||
        (style.includes("position: fixed") && style.includes("bottom"))
      );
    });

    // Combine the results
    const allWatermarks = [...Array.from(watermarks), ...possibleWatermarks];

    // If we found any watermarks, remove them
    if (allWatermarks.length > 0) {
      console.log(`Found ${allWatermarks.length} watermark(s)`);

      allWatermarks.forEach((watermark) => {
        watermark.remove();
      });

      console.log("DeepSite watermark removed successfully");
    } else {
      console.log("No watermark found, using CSS approach only");
    }

    // Try to find and remove any iframe watermarks
    const iframes = iframeDocument.querySelectorAll("iframe");
    Array.from(iframes).forEach((iframe) => {
      try {
        const nestedDoc =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (nestedDoc) {
          const nestedStyle = nestedDoc.createElement("style");
          nestedStyle.textContent = style.textContent;
          nestedDoc.head.appendChild(nestedStyle);
        }
      } catch (e) {
        // CORS restrictions prevent access to cross-origin iframes
        // This is expected and can be safely ignored
        console.log(
          "CORS restriction on nested iframe:",
          e instanceof Error ? e.message : String(e)
        );
      }
    });
  } catch (error) {
    console.error("Error removing watermark:", error);
  }
};

// Capture screenshot of the iframe
const captureScreenshot = async () => {
  try {
    isCapturing.value = true;

    // Hide controls for clean screenshot
    const controls = document.querySelector(".controls") as HTMLElement;
    if (controls) {
      controls.style.display = "none";
    }

    const iframe = previewFrame.value;
    if (!iframe) {
      throw new Error("Preview frame not found");
    }

    // Try to access iframe content
    try {
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (!iframeDocument) {
        throw new Error(
          "Cannot access iframe content due to cross-origin restrictions"
        );
      }

      // Make sure watermarks are removed again before capture
      removeDeepSiteWatermark();

      // Get the scroll height of the document
      const scrollHeight = Math.max(
        iframeDocument.body.scrollHeight,
        iframeDocument.documentElement.scrollHeight
      );

      // Get the scroll width of the document
      const scrollWidth = Math.max(
        iframeDocument.body.scrollWidth,
        iframeDocument.documentElement.scrollWidth
      );

      // Create capturing message
      const capturingMessage = document.createElement("div");
      capturingMessage.className = "capturing-message";
      capturingMessage.innerHTML = `
        <div class="spinner"></div>
        <div class="message">Capturing full page screenshot...</div>
      `;
      document.body.appendChild(capturingMessage);

      // Capture the entire document
      const canvas = await html2canvas(iframeDocument.body, {
        allowTaint: true,
        useCORS: true,
        logging: false,
        width: scrollWidth,
        height: scrollHeight,
        windowWidth: scrollWidth,
        windowHeight: scrollHeight,
        scale: 1,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: false,
        removeContainer: true,
        backgroundColor: "#FFFFFF",
      });

      // Convert to data URL
      const dataUrl = canvas.toDataURL("image/png");

      // Remove capturing message
      document.body.removeChild(capturingMessage);

      // Send screenshot back to parent window
      window.opener.postMessage(
        {
          type: "SCREENSHOT_CAPTURED",
          dataUrl,
        },
        "*"
      );

      // Create success message
      const successMessage = document.createElement("div");
      successMessage.className = "success-message";
      successMessage.innerHTML = `
        <div class="icon"><i class="fas fa-check-circle"></i></div>
        <div class="message">Screenshot captured successfully!</div>
      `;
      document.body.appendChild(successMessage);

      // Close the preview window after a short delay
      setTimeout(() => {
        document.body.removeChild(successMessage);
        closePreview();
      }, 1500);
    } catch (error) {
      console.error("Error capturing screenshot:", error);

      // Create error message
      const errorMessage = document.createElement("div");
      errorMessage.className = "error-message";
      errorMessage.innerHTML = `
        <div class="icon"><i class="fas fa-exclamation-circle"></i></div>
        <div class="message">Failed to capture screenshot due to security restrictions.</div>
        <div class="sub-message">Try using a Chrome extension like GoFullPage instead.</div>
      `;
      document.body.appendChild(errorMessage);

      // Remove error message after a delay
      setTimeout(() => {
        document.body.removeChild(errorMessage);

        // Show controls again
        if (controls) {
          (controls as HTMLElement).style.display = "flex";
        }

        isCapturing.value = false;
      }, 3000);
    }
  } catch (error) {
    console.error("Error:", error);
    toast.error("An error occurred while capturing the screenshot");

    // Show controls again
    const controls = document.querySelector(".controls") as HTMLElement;
    if (controls) {
      controls.style.display = "flex";
    }

    isCapturing.value = false;
  }
};

// Close the preview and return to previous page
const closePreview = () => {
  // Try different methods to close the window
  try {
    // If this is a popup window opened by window.open()
    if (window.opener) {
      window.close();
    } else {
      // If this is a regular route in the same window
      router.back();
    }
  } catch (error) {
    console.error("Error closing window:", error);

    // Fallback: try to navigate back
    try {
      router.back();
    } catch (e) {
      console.error("Failed to navigate back:", e);

      // Last resort: redirect to dashboard
      window.location.href = "/dashboard";
    }
  }
};
</script>

<style scoped>
.fullscreen-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  outline: none; /* Remove outline when focused */
}

.fullscreen-iframe {
  width: 100%;
  height: 100%;
  border: none;
  flex: 1;
}

.esc-hint {
  position: fixed;
  top: 16px;
  right: 16px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  z-index: 10000;
  opacity: 0.7;
  transition: opacity 0.3s;
  pointer-events: none;
  animation: fadeOut 5s forwards;
}

.esc-hint:hover {
  opacity: 1;
  animation: none;
}

.esc-hint kbd {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  padding: 2px 5px;
  margin: 0 3px;
  font-family: monospace;
  font-size: 12px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10001;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

.loading-text {
  color: white;
  font-size: 18px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeOut {
  0% {
    opacity: 0.7;
  }
  70% {
    opacity: 0.7;
  }
  100% {
    opacity: 0;
  }
}

.capturing-message,
.success-message,
.error-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 24px 32px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10002;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  text-align: center;
}

.capturing-message .message,
.success-message .message,
.error-message .message {
  margin-top: 16px;
  font-size: 18px;
  font-weight: 500;
}

.error-message .sub-message {
  margin-top: 8px;
  font-size: 14px;
  opacity: 0.8;
}

.success-message .icon,
.error-message .icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.success-message .icon {
  color: #10b981;
}

.error-message .icon {
  color: #ef4444;
}
</style>
