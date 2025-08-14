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
      
      // Wait for the page to fully settle before extracting text
      setTimeout(() => {
        extractAndLogIXLContent();
      }, 2000); // Wait 2 seconds for dynamic content to load
    }

    function extractAndLogIXLContent() {
      try {
        console.log("🔗 IXL: Starting text content extraction...");
        
        // Extract main content areas
        const mainContent = document.querySelector('main') || document.querySelector('[role="main"]') || document.querySelector('.main-content');
        const questionContent = document.querySelector('.question-content') || document.querySelector('.problem-content') || document.querySelector('[data-testid="question"]');
        const titleElement = document.querySelector('h1') || document.querySelector('.page-title') || document.querySelector('title');
        
        let extractedText = {
          title: titleElement ? titleElement.textContent?.trim() : 'No title found',
          mainContent: mainContent ? mainContent.textContent?.trim() : 'No main content found',
          questionContent: questionContent ? questionContent.textContent?.trim() : 'No question content found',
          url: window.location.href,
          timestamp: new Date().toISOString()
        };

        // Clean up the text content (remove extra whitespace, newlines)
        Object.keys(extractedText).forEach(key => {
          if (typeof extractedText[key] === 'string') {
            extractedText[key] = extractedText[key].replace(/\s+/g, ' ').trim();
          }
        });

        console.log("🔗 IXL: Extracted text content:", extractedText);
        
        // Also log individual sections for easier reading
        console.log("🔗 IXL: Page Title:", extractedText.title);
        console.log("🔗 IXL: Main Content:", extractedText.mainContent);
        console.log("🔗 IXL: Question Content:", extractedText.questionContent);
        console.log("🔗 IXL: Current URL:", extractedText.url);
        
        // Send to parent window for potential use in main app
        window.parent.postMessage({
          type: 'ixl-content-extracted',
          data: extractedText
        }, '*');
        
      } catch (error) {
        console.error("🔗 IXL: Error extracting content:", error);
      }
    }
  } catch (error) {
    console.error("Error in IXL-specific script:", error);
  }
})();
