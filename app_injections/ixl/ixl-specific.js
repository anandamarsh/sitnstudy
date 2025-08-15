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
    let sessionQuestions = [];

    function initIXL() {
      // Intercept AJAX requests to detect question completion and session start
      interceptAJAXRequests();
    }

    function interceptAJAXRequests() {
      try {
        // Intercept fetch requests
        const originalFetch = window.fetch;
        window.fetch = function (...args) {
          const url = args[0];
          const options = args[1] || {};

          // Check if this is a practice pose request (session start)
          if (typeof url === "string" && url.includes("/practice/pose")) {
            return originalFetch.apply(this, args).then((response) => {
              // Clone the response so we can read it multiple times
              const clonedResponse = response.clone();

              // Read the response body
              clonedResponse
                .json()
                .then((data) => {
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
            return originalFetch.apply(this, args).then((response) => {
              // Clone the response so we can read it multiple times
              const clonedResponse = response.clone();

              // Read the response body
              clonedResponse
                .json()
                .then((data) => {
                  // Check if this is a successful completion response
                  if (
                    data &&
                    data.smartScore !== undefined &&
                    data.problemsCorrect !== undefined
                  ) {
                    endCurrentSession(data);
                    showCompletionAlert(data);
                  }
                })
                .catch((error) => {});

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
            this.addEventListener("load", function () {
              try {
                if (this.responseText) {
                  const data = JSON.parse(this.responseText);

                  // Start new session
                  startNewSession(this._ixlUrl, data);
                }
              } catch (error) {}
            });
          }

          // Check for practice summary request (session end)
          if (this._ixlUrl && this._ixlUrl.includes("/practice/summary")) {
            this.addEventListener("load", function () {
              try {
                if (this.responseText) {
                  const data = JSON.parse(this.responseText);

                  // Check if this is a successful completion response
                  if (
                    data &&
                    data.smartScore !== undefined &&
                    data.problemsCorrect !== undefined
                  ) {
                    endCurrentSession(data);
                    showCompletionAlert(data);
                  }
                }
              } catch (error) {}
            });
          }

          return originalXHRSend.apply(this, args);
        };
      } catch (error) {
        console.error("🔗 IXL: Error setting up AJAX interception:", error);
      }
    }

    function startNewSession(url, questionData) {
      try {
        const now = new Date();

        // Extract question information
        const questionInfo = {
          questionNumber: sessionQuestions.length + 1,
          subject: questionData.question?.content?.subject?.name || "unknown",
          gradeLevel:
            questionData.question?.content?.gradeLevel?.name || "unknown",
          url: url,
        };

        // Add to session questions
        sessionQuestions.push(questionInfo);

        // Create or update current session
        currentSession = {
          sessionId: generateSessionId(),
          start: now.toISOString(),
          end: "in_progress",
          questions: [...sessionQuestions],
          status: "active",
        };

        console.log("🔗 IXL: New session started:");

        // Play happy sound for every correct answer!
        triggerSuccessFeedback();

        // Save session to file
        saveSessionToFile();
      } catch (error) {
        console.error("🔗 IXL: Error starting new session:", error);
      }
    }

    function endCurrentSession(completionData) {
      try {
        if (!currentSession) {
          return;
        }

        const now = new Date();

        // Update session with completion data
        currentSession.end = now.toISOString();
        currentSession.status = "completed";

        // Update the last question with completion data
        if (sessionQuestions.length > 0) {
          const lastQuestion = sessionQuestions[sessionQuestions.length - 1];

          // Add completion data in flat structure (only essential fields)
          Object.assign(lastQuestion, {
            smartScore: completionData.smartScore,
            problemsCorrect: completionData.problemsCorrect,
            problemsAttempted: completionData.problemsAttempted,
            timeSpent: completionData.timeSpent,
            gradeName: completionData.gradeName,
            skillSubjectUrl: completionData.skillSubjectUrl,
            gradeSubjectUrl: completionData.gradeSubjectUrl,
            skillUrl: completionData.skillUrl,
            skillId: completionData.skillId,
            skillMastered: completionData.skillMastered,
            skillAtExcellence: completionData.skillAtExcellence,
          });
        }

        // Trigger success feedback via main process
        triggerSuccessFeedback();

        // Save session to file
        saveSessionToFile();

        // Reset for next session
        currentSession = null;
        sessionQuestions = [];
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
        console.log("🔗 IXL: sent IXL_SESSION_DATA");
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

        // Send to the preload script which will relay to main process via IPC
        window.postMessage(
          {
            type: "IXL_QUESTION_COMPLETED",
            data: metadata,
          },
          "*"
        );

        console.log("🔗 IXL: sent IXL_QUESTION_COMPLETED");
      } catch (error) {
        console.error("🔗 IXL: Error processing completion data:", error);
      }
    }

    // Function to trigger success feedback via main process
    function triggerSuccessFeedback() {
      try {
        // Send success feedback request to the preload script
        window.postMessage(
          {
            type: "SUCCESS_FEEDBACK",
            feedbackData: {
              type: "ixl_completion",
              title: "Correct Answer! 🎉",
              message: "Great job! Keep going!",
              soundFile: "success.mp3",
              duration: 2000, // Shorter duration for frequent feedback
              data: {
                subject: currentSession?.questions?.[0]?.subject || "Unknown",
                gradeLevel:
                  currentSession?.questions?.[0]?.gradeLevel || "Unknown",
              },
            },
          },
          "*"
        );
        console.log("🔗 IXL: sent SUCCESS_FEEDBACK");
      } catch (error) {
        console.error("❌ IXL: Error triggering success feedback:", error);
      }
    }
  } catch (error) {
    console.error("Error in IXL-specific script:", error);
  }
})();
