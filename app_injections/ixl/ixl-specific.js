console.log("🔗 IXL-specific script loaded successfully");

(function () {
  try {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initIXL);
    } else {
      initIXL();
    }

    // Session tracking variables
    let currentSession = null;

    function initIXL() {
      console.log(
        "🔗 IXL DOM ready, initializing AJAX interception and session tracking"
      );

      // Intercept AJAX requests to detect question completion and session start
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

          // Check if this is a practice pose request (session start)
          if (typeof url === "string" && url.includes("/practice/pose")) {
            console.log(
              "🔗 IXL: Detected practice pose request (session start):",
              url
            );

            return originalFetch.apply(this, args).then((response) => {
              // Clone the response so we can read it multiple times
              const clonedResponse = response.clone();

              // Read the response body
              clonedResponse
                .json()
                .then((data) => {
                  console.log("🔗 IXL: Practice pose response received:", data);

                  // Start new session
                  startNewSession(url, data);
                })
                .catch((error) => {
                  console.log("🔗 IXL: Pose response is not JSON:", error);
                });

              return response;
            });
          }

          // Check if this is a practice summary request (session end)
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
                    endCurrentSession(data);
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
          // Check for practice pose request (session start)
          if (this._ixlUrl && this._ixlUrl.includes("/practice/pose")) {
            console.log(
              "🔗 IXL: Detected XHR practice pose request (session start):",
              this._ixlUrl
            );

            this.addEventListener("load", function () {
              try {
                if (this.responseText) {
                  const data = JSON.parse(this.responseText);
                  console.log(
                    "🔗 IXL: XHR practice pose response received:",
                    data
                  );

                  // Start new session
                  startNewSession(this._ixlUrl, data);
                }
              } catch (error) {
                console.log(
                  "🔗 IXL: XHR pose response is not valid JSON:",
                  error
                );
              }
            });
          }

          // Check for practice summary request (session end)
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
                    endCurrentSession(data);
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

    function startNewSession(url, questionData) {
      try {
        const now = new Date();
        
        // Extract subject and grade from URL
        const urlParts = url.split("/");
        const subject = urlParts[3] || "unknown"; // e.g., 'maths'
        const gradeLevel = urlParts[4] || "unknown"; // e.g., 'year-2'

        // Count questions from the question data
        const noOfQuestions = questionData.questions?.length || 1;

        // Check if we have an ongoing session for this subject/grade combination
        // If yes, continue that session; if no, start a new one
        if (currentSession && 
            currentSession.subject === subject && 
            currentSession.gradeLevel === gradeLevel &&
            currentSession.end === "") {
          // Continue existing session - just update question count if needed
          if (noOfQuestions > currentSession.noOfQuestions) {
            currentSession.noOfQuestions = noOfQuestions;
            console.log("🔗 IXL: Updated ongoing session:", currentSession);
            saveSessionToFile();
          }
        } else {
          // Start new session
          const sessionId = generateSessionId();
          currentSession = {
            sessionId: sessionId,
            start: now.toISOString(),
            end: "", // Empty string means session is in progress
            subject: subject,
            gradeLevel: gradeLevel,
            noOfQuestions: noOfQuestions,
          };

          console.log("🔗 IXL: New session started:", currentSession);
          saveSessionToFile();
        }
      } catch (error) {
        console.error("🔗 IXL: Error starting new session:", error);
      }
    }

    function endCurrentSession(completionData) {
      try {
        if (!currentSession) {
          console.log("🔗 IXL: No active session to end");
          return;
        }

        const now = new Date();

        // Update session with completion timestamp
        currentSession.end = now.toISOString();

        console.log("🔗 IXL: Session completed:", currentSession);

        // Save session to file
        saveSessionToFile();

        // Reset for next session
        currentSession = null;
      } catch (error) {
        console.error("🔗 IXL: Error ending session:", error);
      }
    }

    function generateSessionId() {
      return (
        "ixl_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
      );
    }

    function saveSessionToFile() {
      try {
        if (!currentSession) {
          console.log("🔗 IXL: No session to save");
          return;
        }

        const now = new Date();
        const filename = `${String(now.getMonth() + 1).padStart(
          2,
          "0"
        )}_${String(now.getDate()).padStart(2, "0")}.json`;
        const filepath = `app_data/session_history/ixl/${filename}`;

        // Create session data to save
        const sessionData = {
          ...currentSession,
          savedAt: now.toISOString(),
        };

        // Use postMessage to send data to the preload script
        sendSessionViaPostMessage(filename, sessionData);

        console.log("🔗 IXL: Session data sent for saving to:", filepath);
      } catch (error) {
        console.error("🔗 IXL: Error saving session to file:", error);
      }
    }

    function sendSessionViaPostMessage(filename, sessionData) {
      try {
        // Send to the preload script which will relay to main process via IPC
        window.postMessage(
          {
            type: "IXL_SESSION_DATA",
            sessionData: {
              filename: filename,
              data: sessionData,
            },
          },
          "*"
        );
        console.log(
          "🔗 IXL: Session data sent via postMessage to preload script"
        );
      } catch (error) {
        console.error("🔗 IXL: Error sending session via postMessage:", error);
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
        console.log(
          "🔗 IXL: Metadata JSON:",
          JSON.stringify(metadata, null, 2)
        );

        // Send to the preload script which will relay to main process via IPC
        window.postMessage(
          {
            type: "IXL_QUESTION_COMPLETED",
            data: metadata,
          },
          "*"
        );

        console.log(
          "🔗 IXL: Question completion data sent via postMessage to preload script"
        );
      } catch (error) {
        console.error("🔗 IXL: Error processing completion data:", error);
      }
    }

    // Function to check if we have an ongoing session for the current subject/grade
    function checkForOngoingSession(subject, gradeLevel) {
      try {
        const now = new Date();
        const filename = `${String(now.getMonth() + 1).padStart(2, "0")}_${String(now.getDate()).padStart(2, "0")}.json`;
        
        // Request the current day's sessions from the main process
        window.postMessage(
          {
            type: "IXL_REQUEST_SESSIONS",
            filename: filename
          },
          "*"
        );
        
        console.log("🔗 IXL: Requested sessions for ongoing session check");
      } catch (error) {
        console.error("🔗 IXL: Error checking for ongoing session:", error);
      }
    }
  } catch (error) {
    console.error("Error in IXL-specific script:", error);
  }
})();
