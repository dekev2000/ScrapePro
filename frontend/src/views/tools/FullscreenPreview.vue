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

// Function to remove watermarks from iframe content
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

    // Add CSS to hide all watermarks
    const style = iframeDocument.createElement("style");
    style.textContent = `
      /* Hide watermark elements */
      [style*="position: fixed"][style*="bottom: 8px"],
      [style*="position: fixed"][style*="z-index: 10"],
      a[href*="deepsite"],
      a[href*="huggingface"],
      img[src*="logo.svg"] {
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
        z-index: 9999;
      }
    `;
    iframeDocument.head.appendChild(style);

    // Execute JavaScript to remove watermarks
    const removeWatermarksScript = iframeDocument.createElement("script");
    removeWatermarksScript.textContent = `
      // Remove watermark elements
      document.querySelectorAll('[style*="position: fixed"][style*="bottom: 8px"]').forEach(el => el.remove());
      document.querySelectorAll('a[href*="deepsite"], a[href*="huggingface"]').forEach(el => el.remove());
      document.querySelectorAll('img[src*="logo.svg"]').forEach(el => el.remove());

      // Create an overlay to cover any remaining watermarks
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.bottom = '0';
      overlay.style.left = '0';
      overlay.style.width = '300px';
      overlay.style.height = '50px';
      overlay.style.backgroundColor = 'white';
      overlay.style.zIndex = '9999';
      document.body.appendChild(overlay);
    `;
    iframeDocument.body.appendChild(removeWatermarksScript);
  } catch (error) {
    console.error("Error removing watermark:", error);
  }
};

// Capture screenshot of the iframe
const captureScreenshot = () => {
  try {
    isCapturing.value = true;

    // Create message to use Chrome extension
    const infoMessage = document.createElement("div");
    infoMessage.className = "info-message";
    infoMessage.innerHTML = `
      <div class="icon"><i class="fas fa-info-circle"></i></div>
      <div class="message">Utilisez l'extension Chrome GoFullPage pour capturer une image complète du site</div>
    `;
    document.body.appendChild(infoMessage);

    // Remove message after a delay
    setTimeout(() => {
      document.body.removeChild(infoMessage);
      isCapturing.value = false;
    }, 3000);

    // Make sure watermarks are removed
    removeDeepSiteWatermark();
  } catch (error) {
    console.error("Error:", error);
    toast.error("Une erreur s'est produite");
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
.error-message,
.info-message {
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
.error-message .message,
.info-message .message {
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
.error-message .icon,
.info-message .icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.success-message .icon {
  color: #10b981;
}

.error-message .icon {
  color: #ef4444;
}

.info-message .icon {
  color: #3b82f6;
}
</style>
