console.log("🔗 IXL-specific script loaded successfully");

(function () {
  try {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initIXL);
    } else {
      initIXL();
    }

    function initIXL() {
      console.log("🔗 IXL DOM ready, initializing custom features");
      alert("🔗 IXL DOM ready, initializing custom features");
    }
  } catch (error) {
    console.error("Error in IXL-specific script:", error);
  }
})();
