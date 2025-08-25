// Content script for additional blocking functionality
(function() {
    'use strict';
    
    // Check if this page should be blocked based on time limits
    function checkTimeLimitBlocking() {
        const hostname = window.location.hostname.toLowerCase();
        
        chrome.storage.sync.get(['websites', 'extensionEnabled'], function(result) {
            const websites = result.websites || [];
            const isEnabled = result.extensionEnabled !== false;
            
            if (!isEnabled) return;
            
            const website = websites.find(w => w.domain === hostname || hostname.endsWith('.' + w.domain));
            
            if (website && website.isLocked) {
                // This website is locked due to time limit exceeded
                console.log('�� Website is locked, showing blocking overlay');
                
                // Instead of redirecting, show the blocking overlay directly
                createTimeLimitBlockingOverlay(website);
                return;
            }
            
            // Check if approaching time limit (90%)
            if (website && !website.isLocked && website.timeSpent >= website.timeLimit * 0.9) {
                showTimeWarning(website);
            }
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
        const hostname = window.location.hostname.toLowerCase();
        
        chrome.storage.sync.get(['blockedSites', 'extensionEnabled'], function(result) {
            const blockedSites = result.blockedSites || [];
            const isEnabled = result.extensionEnabled !== false;
            
            if (!isEnabled) return;
            
            for (const blockedSite of blockedSites) {
                if (hostname === blockedSite || hostname.endsWith('.' + blockedSite)) {
                    // This page should be blocked, but if we're here, it means the background script didn't catch it
                    // Redirect to the blocked page
                    window.location.href = chrome.runtime.getURL('blocked.html');
                    return;
                }
            }
        });
    }
    
    // Inject a blocking overlay if needed (fallback)
    function injectBlockingOverlay() {
        const hostname = window.location.hostname.toLowerCase();
        
        chrome.storage.sync.get(['blockedSites', 'extensionEnabled'], function(result) {
            const blockedSites = result.blockedSites || [];
            const isEnabled = result.extensionEnabled !== false;
            
            if (!isEnabled) return;
            
            for (const blockedSite of blockedSites) {
                if (hostname === blockedSite || hostname.endsWith('.' + blockedSite)) {
                    createBlockingOverlay();
                    return;
                }
            }
        });
    }
    
    // Create a blocking overlay
    function createBlockingOverlay() {
        // Remove any existing overlay
        const existingOverlay = document.getElementById('website-blocker-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'website-blocker-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        contentDiv.style.cssText = 'max-width: 500px; padding: 40px;';
        
        const icon = document.createElement('h1');
        icon.style.cssText = 'font-size: 48px; margin-bottom: 20px;';
        icon.textContent = '🚫';
        
        const title = document.createElement('h2');
        title.style.cssText = 'font-size: 32px; margin-bottom: 16px; font-weight: 600;';
        title.textContent = 'Website Blocked';
        
        const description = document.createElement('p');
        description.style.cssText = 'font-size: 18px; margin-bottom: 24px; opacity: 0.9;';
        description.textContent = 'This website has been blocked by the ZenFocus extension to help you achieve zen-like focus.';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 16px; justify-content: center;';
        
        const goBackBtn = document.createElement('button');
        goBackBtn.id = 'go-back-btn';
        goBackBtn.style.cssText = `
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            color: white;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        goBackBtn.textContent = 'Go Back';
        
        const manageSitesBtn = document.createElement('button');
        manageSitesBtn.id = 'manage-sites-btn';
        manageSitesBtn.style.cssText = `
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.9);
            border: none;
            border-radius: 8px;
            color: #333;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        manageSitesBtn.textContent = 'Manage Sites';
        
        // Add event listeners
        goBackBtn.addEventListener('click', function() {
            window.history.back();
        });
        
        manageSitesBtn.addEventListener('click', function() {
            chrome.runtime.sendMessage({ action: 'openPopup' });
        });
        
        // Add hover effects
        goBackBtn.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(255, 255, 255, 0.3)';
        });
        
        goBackBtn.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(255, 255, 255, 0.2)';
        });
        
        manageSitesBtn.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(255, 255, 255, 1)';
        });
        
        manageSitesBtn.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(255, 255, 255, 0.9)';
        });
        
        // Assemble the overlay
        buttonContainer.appendChild(goBackBtn);
        buttonContainer.appendChild(manageSitesBtn);
        
        contentDiv.appendChild(icon);
        contentDiv.appendChild(title);
        contentDiv.appendChild(description);
        contentDiv.appendChild(buttonContainer);
        
        overlay.appendChild(contentDiv);
        
        // Insert overlay
        document.body.appendChild(overlay);
        
        // Prevent scrolling
        document.body.style.overflow = 'hidden';
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
        if (request.action === 'checkBlocked') {
            checkIfBlocked();
            sendResponse({ success: true });
        } else if (request.action === 'blockImmediately') {
            // Background script is telling us to block immediately
            console.log('🔒 Received immediate block command');
            
            // Get the website info to show in the overlay
            chrome.storage.sync.get(['websites'], function(result) {
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
            
            sendResponse({ success: true });
        } else if (request.action === 'showWarning') {
            // Background script is telling us to show a warning
            showTimeWarning(request.website);
            sendResponse({ success: true });
        }
    });
    
    // Create a generic blocking overlay if website info is not available
    function createGenericBlockingOverlay() {
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
            checkTimeLimitBlocking();
            checkIfBlocked();
            injectBlockingOverlay();
        });
    } else {
        checkTimeLimitBlocking();
        checkIfBlocked();
        injectBlockingOverlay();
    }
    
    // Also check periodically for immediate blocking
    setInterval(function() {
        checkTimeLimitBlocking();
    }, 5000); // Check every 5 seconds
    
    // Also check when the page changes (for SPA applications)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(() => {
                checkTimeLimitBlocking();
                checkIfBlocked();
                injectBlockingOverlay();
            }, 100);
        }
    }).observe(document, { subtree: true, childList: true });
    
})(); 