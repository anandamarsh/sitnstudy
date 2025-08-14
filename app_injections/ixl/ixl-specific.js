console.log("🔗 IXL-specific script loaded successfully");

(function () {
  try {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initIXL);
    } else {
      initIXL();
    }

    function initIXL() {
      console.log("🔗 IXL DOM ready, initializing AJAX interception");

      // Intercept AJAX requests to detect question completion
      interceptAJAXRequests();
    }

    function interceptAJAXRequests() {
      try {
        console.log("🔗 IXL: Setting up AJAX interception...");

        // Intercept fetch requests
        const originalFetch = window.fetch;
        window.fetch = function (...args) {
          const url = args[0];
          const options = args[1] || {};

          // Check if this is a practice summary request
          if (typeof url === "string" && url.includes("/practice/summary")) {
            console.log("🔗 IXL: Detected practice summary request:", url);

            return originalFetch.apply(this, args).then((response) => {
              // Clone the response so we can read it multiple times
              const clonedResponse = response.clone();

              // Read the response body
              clonedResponse
                .json()
                .then((data) => {
                  console.log(
                    "🔗 IXL: Practice summary response received:",
                    data
                  );

                  // Check if this is a successful completion response
                  if (
                    data &&
                    data.smartScore !== undefined &&
                    data.problemsCorrect !== undefined
                  ) {
                    console.log("🔗 IXL: Question completion detected!");
                    showCompletionAlert(data);
                  }
                })
                .catch((error) => {
                  console.log("🔗 IXL: Response is not JSON:", error);
                });

              return response;
            });
          }

          // For non-matching requests, proceed normally
          return originalFetch.apply(this, args);
        };

        // Intercept XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function (method, url, ...args) {
          this._ixlUrl = url;
          return originalXHROpen.apply(this, [method, url, ...args]);
        };

        XMLHttpRequest.prototype.send = function (...args) {
          if (this._ixlUrl && this._ixlUrl.includes("/practice/summary")) {
            console.log(
              "🔗 IXL: Detected XHR practice summary request:",
              this._ixlUrl
            );

            this.addEventListener("load", function () {
              try {
                if (this.responseText) {
                  const data = JSON.parse(this.responseText);
                  console.log(
                    "🔗 IXL: XHR practice summary response received:",
                    data
                  );

                  // Check if this is a successful completion response
                  if (
                    data &&
                    data.smartScore !== undefined &&
                    data.problemsCorrect !== undefined
                  ) {
                    console.log(
                      "🔗 IXL: Question completion detected via XHR!"
                    );
                    showCompletionAlert(data);
                  }
                }
              } catch (error) {
                console.log("🔗 IXL: XHR response is not valid JSON:", error);
              }
            });
          }

          return originalXHRSend.apply(this, args);
        };

        console.log("🔗 IXL: AJAX interception setup complete");
      } catch (error) {
        console.error("🔗 IXL: Error setting up AJAX interception:", error);
      }
    }

    function showCompletionAlert(data) {
      try {
        // Extract key metadata
        const metadata = {
          smartScore: data.smartScore,
          problemsCorrect: data.problemsCorrect,
          problemsAttempted: data.problemsAttempted,
          timeSpent: data.timeSpent,
          masteryMessage: data.masteryMessage,
          gradeName: data.gradeName,
          skillSubjectUrl: data.skillSubjectUrl,
          gradeSubjectUrl: data.gradeSubjectUrl,
          skillUrl: data.skillUrl,
          skillId: data.skillId,
          showRecommendations: data.showRecommendations,
          prizesToReveal: data.prizesToReveal,
          skillMastered: data.skillMastered,
          skillAtExcellence: data.skillAtExcellence,
        };

        // Log the metadata to console
        console.log("🔗 IXL: Question completion detected!");
        console.log("🔗 IXL: Metadata JSON:", JSON.stringify(metadata, null, 2));

        // Send to parent window via postMessage
        window.parent.postMessage(
          {
            type: "ixl-question-completed",
            data: metadata,
          },
          "*"
        );

        // Also try to send via ipcRenderer if available (for direct Electron communication)
        if (window.ipcRenderer) {
          try {
            window.ipcRenderer.send("ixl-question-completed", metadata);
            console.log("🔗 IXL: Sent via ipcRenderer to main process");
          } catch (ipcError) {
            console.log("🔗 IXL: ipcRenderer not available, using postMessage only");
          }
        }

      } catch (error) {
        console.error("🔗 IXL: Error processing completion data:", error);
      }
    }
  } catch (error) {
    console.error("Error in IXL-specific script:", error);
  }
})();
