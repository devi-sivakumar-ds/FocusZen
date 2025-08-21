// Background service worker for website blocking
let isEnabled = true;

// Initialize extension state
chrome.storage.sync.get(['extensionEnabled'], function(result) {
    isEnabled = result.extensionEnabled !== false; // Default to true
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'toggleExtension') {
        isEnabled = request.enabled;
        sendResponse({ success: true });
    }
});

// Block navigation to blocked websites
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
    if (!isEnabled) return;
    
    const url = new URL(details.url);
    const hostname = url.hostname.toLowerCase();
    
    // Check if the hostname is in the blocked list
    chrome.storage.sync.get(['blockedSites'], function(result) {
        const blockedSites = result.blockedSites || [];
        
        for (const blockedSite of blockedSites) {
            if (hostname === blockedSite || hostname.endsWith('.' + blockedSite)) {
                // Block the navigation
                chrome.tabs.update(details.tabId, {
                    url: chrome.runtime.getURL('blocked.html')
                });
                
                // Log the block attempt
                logBlockAttempt(hostname);
                break;
            }
        }
    });
});

// Block navigation when typing in address bar
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
    if (!isEnabled) return;
    
    // Only handle main frame navigation (not iframes)
    if (details.frameId !== 0) return;
    
    const url = new URL(details.url);
    const hostname = url.hostname.toLowerCase();
    
    chrome.storage.sync.get(['blockedSites'], function(result) {
        const blockedSites = result.blockedSites || [];
        
        for (const blockedSite of blockedSites) {
            if (hostname === blockedSite || hostname.endsWith('.' + blockedSite)) {
                // Block the navigation
                chrome.tabs.update(details.tabId, {
                    url: chrome.runtime.getURL('blocked.html')
                });
                
                // Log the block attempt
                logBlockAttempt(hostname);
                break;
            }
        }
    });
});

// Block navigation when clicking links
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
    if (!isEnabled) return;
    
    const url = new URL(details.url);
    const hostname = url.hostname.toLowerCase();
    
    chrome.storage.sync.get(['blockedSites'], function(result) {
        const blockedSites = result.blockedSites || [];
        
        for (const blockedSite of blockedSites) {
            if (hostname === blockedSite || hostname.endsWith('.' + blockedSite)) {
                // Block the navigation
                chrome.tabs.update(details.tabId, {
                    url: chrome.runtime.getURL('blocked.html')
                });
                
                // Log the block attempt
                logBlockAttempt(hostname);
                break;
            }
        }
    });
});

// Log block attempts for statistics
function logBlockAttempt(hostname) {
    const today = new Date().toDateString();
    
    chrome.storage.sync.get(['todayBlocked', 'lastBlockedDate'], function(result) {
        const lastDate = result.lastBlockedDate;
        let todayCount = result.todayBlocked || 0;
        
        if (lastDate !== today) {
            todayCount = 1;
        } else {
            todayCount++;
        }
        
        chrome.storage.sync.set({ 
            todayBlocked: todayCount,
            lastBlockedDate: today
        });
    });
}

// Handle installation and updates
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        // Set default values for new installations
        chrome.storage.sync.set({
            blockedSites: [],
            extensionEnabled: true,
            todayBlocked: 0,
            lastBlockedDate: new Date().toDateString()
        });
    }
});

// Handle tab updates to check for blocked sites
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (!isEnabled || changeInfo.status !== 'complete') return;
    
    const url = new URL(tab.url);
    const hostname = url.hostname.toLowerCase();
    
    chrome.storage.sync.get(['blockedSites'], function(result) {
        const blockedSites = result.blockedSites || [];
        
        for (const blockedSite of blockedSites) {
            if (hostname === blockedSite || hostname.endsWith('.' + blockedSite)) {
                // Block the page
                chrome.tabs.update(tabId, {
                    url: chrome.runtime.getURL('blocked.html')
                });
                
                // Log the block attempt
                logBlockAttempt(hostname);
                break;
            }
        }
    });
}); 