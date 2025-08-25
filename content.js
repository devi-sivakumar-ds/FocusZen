// Content script for additional blocking functionality
(function() {
    'use strict';
    
    // Check if extension context is still valid
    function isExtensionValid() {
        try {
            return typeof chrome !== 'undefined' && 
                   chrome.runtime && 
                   chrome.runtime.id && 
                   !chrome.runtime.lastError;
        } catch (e) {
            return false;
        }
    }
    
    // Safe wrapper for chrome API calls
    function safeChromeCall(callback) {
        if (!isExtensionValid()) {
            console.log('Extension context invalid, skipping operation');
            return;
        }
        
        try {
            callback();
        } catch (e) {
            if (e.message && e.message.includes('Extension context invalidated')) {
                console.log('Extension context invalidated, removing content script');
                // Clean up and stop execution
                cleanup();
                return;
            }
            console.error('Error in chrome API call:', e);
        }
    }
    
    // Cleanup function
    function cleanup() {
        // Remove any overlays
        const overlays = document.querySelectorAll('[id*="overlay"]');
        overlays.forEach(overlay => overlay.remove());
        
        // Remove event listeners
        if (window.cleanupInterval) {
            clearInterval(window.cleanupInterval);
        }
        
        // Stop all timers
        if (window.checkInterval) {
            clearInterval(window.checkInterval);
        }
        
        console.log('Content script cleaned up');
    }
    
    // Check if this page should be blocked based on time limits
    function checkTimeLimitBlocking() {
        if (!isExtensionValid()) return;
        
        const hostname = window.location.hostname.toLowerCase();
        
        safeChromeCall(() => {
            chrome.storage.sync.get(['websites', 'extensionEnabled'], function(result) {
                if (chrome.runtime.lastError) {
                    console.log('Storage error:', chrome.runtime.lastError);
                    return;
                }
                
                const websites = result.websites || [];
                const isEnabled = result.extensionEnabled !== false;
                
                if (!isEnabled) return;
                
                const website = websites.find(w => w.domain === hostname || hostname.endsWith('.' + w.domain));
                
                if (website && website.isLocked) {
                    // This website is locked due to time limit exceeded
                    console.log('🔒 Website is locked, showing blocking overlay');
                    
                    // Instead of redirecting, show the blocking overlay directly
                    createTimeLimitBlockingOverlay(website);
                    return;
                }
                
                // Check if approaching time limit (90%)
                if (website && !website.isLocked && website.timeSpent >= website.timeLimit * 0.9) {
                    showTimeWarning(website);
                }
            });
        });
    }
    
    // Show time warning overlay
    function showTimeWarning(website) {
        // Remove any existing warning
        const existingWarning = document.getElementById('time-warning-overlay');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        const timeRemaining = website.timeLimit - website.timeSpent;
        
        const warning = document.createElement('div');
        warning.id = 'time-warning-overlay';
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
            color: #333;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 999999;
            max-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideIn 0.5s ease;
        `;
        
        // Create content using DOM methods instead of innerHTML
        const headerDiv = document.createElement('div');
        headerDiv.style.cssText = 'display: flex; align-items: center; margin-bottom: 10px;';
        
        const iconSpan = document.createElement('span');
        iconSpan.style.cssText = 'font-size: 24px; margin-right: 10px;';
        iconSpan.textContent = '⚠️';
        
        const title = document.createElement('h3');
        title.style.cssText = 'margin: 0; font-size: 16px;';
        title.textContent = 'Time Warning!';
        
        headerDiv.appendChild(iconSpan);
        headerDiv.appendChild(title);
        
        const message = document.createElement('p');
        message.style.cssText = 'margin: 0 0 15px 0; font-size: 14px; line-height: 1.4;';
        message.innerHTML = `You have <strong>${timeRemaining} minutes</strong> remaining on ${website.domain}`;
        
        const dismissBtn = document.createElement('button');
        dismissBtn.id = 'dismiss-warning';
        dismissBtn.style.cssText = `
            background: rgba(255,255,255,0.9);
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
        `;
        dismissBtn.textContent = 'Dismiss';
        
        // Assemble the warning
        warning.appendChild(headerDiv);
        warning.appendChild(message);
        warning.appendChild(dismissBtn);
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Add event listener to dismiss button
        dismissBtn.addEventListener('click', function() {
            warning.remove();
        });
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (warning.parentNode) {
                warning.remove();
            }
        }, 10000);
        
        document.body.appendChild(warning);
    }
    
    // Check if this page should be blocked
    function checkIfBlocked() {
        if (!isExtensionValid()) return;
        
        const hostname = window.location.hostname.toLowerCase();
        
        safeChromeCall(() => {
            chrome.storage.sync.get(['blockedSites', 'extensionEnabled'], function(result) {
                if (chrome.runtime.lastError) {
                    console.log('Storage error:', chrome.runtime.lastError);
                    return;
                }
                
                const blockedSites = result.blockedSites || [];
                const isEnabled = result.extensionEnabled !== false;
                
                if (!isEnabled) return;
                
                for (const blockedSite of blockedSites) {
                    if (hostname === blockedSite || hostname.endsWith('.' + blockedSite)) {
                        // This page should be blocked - content script will handle it
                        console.log('Website should be blocked, but content script will handle display');
                        return;
                    }
                }
            });
        });
    }
    
    // Inject a blocking overlay if needed (fallback)
    function injectBlockingOverlay() {
        if (!isExtensionValid()) return;
        
        const hostname = window.location.hostname.toLowerCase();
        
        safeChromeCall(() => {
            chrome.storage.sync.get(['blockedSites', 'extensionEnabled'], function(result) {
                if (chrome.runtime.lastError) {
                    console.log('Storage error:', chrome.runtime.lastError);
                    return;
                }
                
                const blockedSites = result.blockedSites || [];
                const isEnabled = result.extensionEnabled !== false;
                
                if (!isEnabled) return;
                
                for (const blockedSite of blockedSites) {
                    if (hostname === blockedSite || hostname.endsWith('.' + blockedSite)) {
                        // Content script will handle blocking display
                        console.log('Website should be blocked, but content script will handle display');
                        return;
                    }
                }
            });
        });
    }
    
    // Create a blocking overlay when time limit is exceeded
    function createTimeLimitBlockingOverlay(website) {
        // Remove any existing overlay
        const existingOverlay = document.getElementById('time-limit-blocking-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        const timeOver = website.timeSpent - website.timeLimit;
        
        const overlay = document.createElement('div');
        overlay.id = 'time-limit-blocking-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            z-index: 999999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
        `;
        
        // Create content using DOM methods instead of innerHTML
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = 'max-width: 600px; padding: 40px;';
        
        // Timer icon
        const iconDiv = document.createElement('div');
        iconDiv.style.cssText = 'font-size: 80px; margin-bottom: 30px;';
        iconDiv.textContent = '⏰';
        
        // Main heading
        const heading = document.createElement('h1');
        heading.style.cssText = 'font-size: 48px; margin-bottom: 20px; font-weight: 700;';
        heading.textContent = 'Time Limit Exceeded!';
        
        // Subtitle
        const subtitle = document.createElement('p');
        subtitle.style.cssText = 'font-size: 24px; margin-bottom: 30px; opacity: 0.9; font-weight: 300;';
        subtitle.textContent = `Daily time limit exceeded for ${website.domain}`;
        
        // Description
        const description = document.createElement('p');
        description.style.cssText = 'font-size: 18px; margin-bottom: 40px; opacity: 0.8; line-height: 1.6;';
        description.innerHTML = `You spent <strong>${website.timeSpent} minutes</strong> on this website today, 
            which exceeds your limit of <strong>${website.timeLimit} minutes</strong>.<br>
            <strong>${timeOver} minutes over limit.</strong><br><br>
            This website is now locked until tomorrow, or you can reset it manually in the extension.<br><br>
            <em style="opacity: 0.7;">To continue browsing, close this tab or navigate to a different website.</em>`;
        
        // Stats container
        const statsContainer = document.createElement('div');
        statsContainer.style.cssText = 'margin-top: 50px; padding: 30px; background: rgba(255, 255, 255, 0.1); border-radius: 16px; backdrop-filter: blur(10px);';
        
        const statsHeading = document.createElement('h3');
        statsHeading.style.cssText = 'margin-bottom: 20px; font-size: 20px; opacity: 0.9;';
        statsHeading.textContent = "Today's Progress";
        
        const statsGrid = document.createElement('div');
        statsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px;';
        
        // Minutes Used stat
        const minutesUsedStat = createStatItem(website.timeSpent, 'Minutes Used');
        const dailyLimitStat = createStatItem(website.timeLimit, 'Daily Limit');
        const overLimitStat = createStatItem(timeOver, 'Over Limit', '#ffc107');
        
        statsGrid.appendChild(minutesUsedStat);
        statsGrid.appendChild(dailyLimitStat);
        statsGrid.appendChild(overLimitStat);
        
        statsContainer.appendChild(statsHeading);
        statsContainer.appendChild(statsGrid);
        
        // Assemble the overlay
        contentDiv.appendChild(iconDiv);
        contentDiv.appendChild(heading);
        contentDiv.appendChild(subtitle);
        contentDiv.appendChild(description);
        contentDiv.appendChild(statsContainer);
        overlay.appendChild(contentDiv);
        
        // Insert overlay
        document.body.appendChild(overlay);
        
        // Prevent scrolling
        document.body.style.overflow = 'hidden';
        
        console.log('🔒 Time limit blocking overlay created');
    }
    
    // Helper function to create stat items
    function createStatItem(value, label, color = 'white') {
        const statItem = document.createElement('div');
        statItem.style.cssText = 'text-align: center;';
        
        const valueDiv = document.createElement('div');
        valueDiv.style.cssText = `font-size: 32px; font-weight: 700; margin-bottom: 8px; color: ${color};`;
        valueDiv.textContent = value;
        
        const labelDiv = document.createElement('div');
        labelDiv.style.cssText = 'font-size: 14px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.5px;';
        labelDiv.textContent = label;
        
        statItem.appendChild(valueDiv);
        statItem.appendChild(labelDiv);
        
        return statItem;
    }
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (!isExtensionValid()) {
            console.log('Extension context invalid, ignoring message');
            return;
        }
        
        try {
            if (request.action === 'checkBlocked') {
                checkIfBlocked();
                sendResponse({ success: true });
            } else if (request.action === 'blockImmediately') {
                // Background script is telling us to block immediately
                console.log('🔒 Received immediate block command');
                
                // Get the website info to show in the overlay
                safeChromeCall(() => {
                    chrome.storage.sync.get(['websites'], function(result) {
                        if (chrome.runtime.lastError) {
                            console.log('Storage error:', chrome.runtime.lastError);
                            return;
                        }
                        
                        const websites = result.websites || [];
                        const currentDomain = window.location.hostname.toLowerCase();
                        const website = websites.find(w => 
                            w.domain === currentDomain || currentDomain.endsWith('.' + w.domain)
                        );
                        
                        if (website) {
                            createTimeLimitBlockingOverlay(website);
                        } else {
                            // Fallback if website not found
                            createGenericBlockingOverlay();
                        }
                    });
                });
                
                sendResponse({ success: true });
            } else if (request.action === 'showWarning') {
                // Background script is telling us to show a warning
                showTimeWarning(request.website);
                sendResponse({ success: true });
            }
        } catch (e) {
            if (e.message && e.message.includes('Extension context invalidated')) {
                console.log('Extension context invalidated in message listener');
                cleanup();
                return;
            }
            console.error('Error in message listener:', e);
        }
    });
    
    // Create a generic blocking overlay if website info is not available
    function createGenericBlockingOverlay() {
        if (!isExtensionValid()) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'generic-blocking-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            z-index: 999999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
        `;
        
        // Create content using DOM methods instead of innerHTML
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = 'max-width: 600px; padding: 40px;';
        
        // Timer icon
        const iconDiv = document.createElement('div');
        iconDiv.style.cssText = 'font-size: 80px; margin-bottom: 30px;';
        iconDiv.textContent = '⏰';
        
        // Main heading
        const heading = document.createElement('h1');
        heading.style.cssText = 'font-size: 48px; margin-bottom: 20px; font-weight: 700;';
        heading.textContent = 'Time Limit Exceeded!';
        
        // Description
        const description = document.createElement('p');
        description.style.cssText = 'font-size: 18px; margin-bottom: 40px; opacity: 0.8; line-height: 1.6;';
        description.innerHTML = `This website has been locked due to exceeding your daily time limit.<br><br>
            The lock will reset tomorrow, or you can reset it manually in the extension.<br><br>
            <em style="opacity: 0.7;">To continue browsing, close this tab or navigate to a different website.</em>`;
        
        // Assemble the overlay
        contentDiv.appendChild(iconDiv);
        contentDiv.appendChild(heading);
        contentDiv.appendChild(description);
        overlay.appendChild(contentDiv);
        
        // Insert overlay
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    }
    
    // Run initial checks
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (isExtensionValid()) {
                checkTimeLimitBlocking();
                checkIfBlocked();
                injectBlockingOverlay();
            }
        });
    } else {
        if (isExtensionValid()) {
            checkTimeLimitBlocking();
            checkIfBlocked();
            injectBlockingOverlay();
        }
    }
    
    // Also check periodically for immediate blocking
    if (isExtensionValid()) {
        window.checkInterval = setInterval(function() {
            if (isExtensionValid()) {
                checkTimeLimitBlocking();
            } else {
                console.log('Extension context invalid, stopping periodic checks');
                clearInterval(window.checkInterval);
                cleanup();
            }
        }, 5000); // Check every 5 seconds
    }
    
    // Also check when the page changes (for SPA applications)
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (!isExtensionValid()) return;
        
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(() => {
                if (isExtensionValid()) {
                    checkTimeLimitBlocking();
                    checkIfBlocked();
                    injectBlockingOverlay();
                }
            }, 100);
        }
    }).observe(document, { subtree: true, childList: true });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
    
    // The extension context validation in isExtensionValid() function
    // will handle detecting when the extension becomes invalid
    
})(); 