// Background service worker for website time limits
let isEnabled = true;
let activeTabs = new Map(); // Track active tabs and their start times
let websites = []; // Track websites with time limits
let updateInterval = null; // Interval for periodic updates

// Initialize extension state
chrome.storage.sync.get(['extensionEnabled', 'websites'], function(result) {
    isEnabled = result.extensionEnabled !== false; // Default to true
    websites = result.websites || [];
    startPeriodicUpdates();
});

// Start periodic updates every 30 seconds
function startPeriodicUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    updateInterval = setInterval(function() {
        if (isEnabled) {
            updateActiveTabTime();
            checkAndLockWebsites();
        }
    }, 30000); // Update every 30 seconds
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'toggleExtension') {
        isEnabled = request.enabled;
        if (isEnabled) {
            startPeriodicUpdates();
        } else {
            if (updateInterval) {
                clearInterval(updateInterval);
                updateInterval = null;
            }
        }
        sendResponse({ success: true });
    } else if (request.action === 'getWebsites') {
        sendResponse({ websites: websites });
    } else if (request.action === 'updateWebsite') {
        const { domain, updates } = request;
        const website = websites.find(w => w.domain === domain);
        if (website) {
            Object.assign(website, updates);
            chrome.storage.sync.set({ websites: websites });
            sendResponse({ success: true });
        } else {
            sendResponse({ success: false });
        }
    }
});

// Track tab activation and deactivation for time tracking
chrome.tabs.onActivated.addListener(function(activeInfo) {
    if (!isEnabled) return;
    
    const tabId = activeInfo.tabId;
    const timestamp = Date.now();
    
    // Stop tracking previous active tab
    if (activeTabs.size > 0) {
        const [prevTabId, prevStartTime] = activeTabs.entries().next().value;
        if (prevTabId !== tabId) {
            updateWebsiteTime(prevTabId, prevStartTime, timestamp);
            activeTabs.delete(prevTabId);
        }
    }
    
    // Start tracking new active tab
    activeTabs.set(tabId, timestamp);
});

// Track tab updates for time tracking and blocking
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (!isEnabled || changeInfo.status !== 'complete') return;
    
    try {
        const url = new URL(tab.url);
        const hostname = url.hostname.toLowerCase();
        
        // Check if this website has a time limit
        const website = websites.find(w => w.domain === hostname || hostname.endsWith('.' + w.domain));
        
        if (website) {
            // Check if website is locked
            if (website.isLocked) {
                // Block access to locked website
                chrome.tabs.update(tabId, {
                    url: chrome.runtime.getURL('blocked.html')
                });
                return;
            }
            
            // Check if time limit exceeded
            if (website.timeSpent >= website.timeLimit) {
                // Lock the website
                website.isLocked = true;
                chrome.storage.sync.set({ websites: websites });
                
                // Block access
                chrome.tabs.update(tabId, {
                    url: chrome.runtime.getURL('blocked.html')
                });
                
                return;
            }
            
            // Update active tab tracking
            if (activeTabs.has(tabId)) {
                const startTime = activeTabs.get(tabId);
                const currentTime = Date.now();
                updateWebsiteTime(tabId, startTime, currentTime);
                activeTabs.set(tabId, currentTime);
            } else {
                activeTabs.set(tabId, Date.now());
            }
        }
    } catch (e) {
        console.log('Error in tab update:', e);
    }
});

// Track tab removal
chrome.tabs.onRemoved.addListener(function(tabId) {
    if (activeTabs.has(tabId)) {
        const startTime = activeTabs.get(tabId);
        const endTime = Date.now();
        updateWebsiteTime(tabId, startTime, endTime);
        activeTabs.delete(tabId);
    }
});

// Update website time tracking
function updateWebsiteTime(tabId, startTime, endTime) {
    chrome.tabs.get(tabId, function(tab) {
        if (chrome.runtime.lastError || !tab || !tab.url) return;
        
        try {
            const url = new URL(tab.url);
            const hostname = url.hostname.toLowerCase();
            const timeSpent = Math.floor((endTime - startTime) / 1000 / 60); // Convert to minutes
            
            if (timeSpent > 0 && hostname) {
                const website = websites.find(w => w.domain === hostname || hostname.endsWith('.' + w.domain));
                
                if (website) {
                    const today = new Date().toDateString();
                    
                    // Reset time if it's a new day
                    if (website.addedDate !== today) {
                        website.timeSpent = 0;
                        website.isLocked = false;
                        website.addedDate = today;
                    }
                    
                    // Add time spent
                    website.timeSpent += timeSpent;
                    
                    // Save updated websites
                    chrome.storage.sync.set({ websites: websites });
                    
                    console.log(`Updated time for ${website.domain}: ${website.timeSpent}m / ${website.timeLimit}m`);
                }
            }
        } catch (e) {
            console.log('Error updating website time:', e);
        }
    });
}

// Update active tab time periodically
function updateActiveTabTime() {
    if (!isEnabled || activeTabs.size === 0) return;
    
    const [tabId, startTime] = activeTabs.entries().next().value;
    const currentTime = Date.now();
    
    chrome.tabs.get(tabId, function(tab) {
        if (chrome.runtime.lastError || !tab || !tab.url) return;
        
        try {
            const url = new URL(tab.url);
            const hostname = url.hostname.toLowerCase();
            const website = websites.find(w => w.domain === hostname || hostname.endsWith('.' + w.domain));
            
            if (website) {
                const timeSpent = Math.floor((currentTime - startTime) / 1000 / 60);
                if (timeSpent > 0) {
                    const today = new Date().toDateString();
                    
                    // Reset time if it's a new day
                    if (website.addedDate !== today) {
                        website.timeSpent = 0;
                        website.isLocked = false;
                        website.addedDate = today;
                    }
                    
                    // Update time spent (only add the difference since last update)
                    const lastUpdateTime = website.lastUpdateTime || startTime;
                    const timeDiff = Math.floor((currentTime - lastUpdateTime) / 1000 / 60);
                    
                    if (timeDiff > 0) {
                        website.timeSpent += timeDiff;
                        website.lastUpdateTime = currentTime;
                        
                        // Save updated websites
                        chrome.storage.sync.set({ websites: websites });
                        
                        // Update active tab start time
                        activeTabs.set(tabId, currentTime);
                        
                        console.log(`Periodic update for ${website.domain}: ${website.timeSpent}m / ${website.timeLimit}m`);
                    }
                }
            }
        } catch (e) {
            console.log('Error in periodic update:', e);
        }
    });
}

// Check and lock websites that exceed time limits
function checkAndLockWebsites() {
    if (!isEnabled) return;
    
    let updated = false;
    
    websites.forEach(website => {
        if (website.timeSpent >= website.timeLimit && !website.isLocked) {
            website.isLocked = true;
            updated = true;
            
            console.log(`Locking website: ${website.domain} (${website.timeSpent}m >= ${website.timeLimit}m)`);
            
            // Block all tabs with this website
            chrome.tabs.query({ url: `*://${website.domain}/*` }, function(tabs) {
                tabs.forEach(tab => {
                    chrome.tabs.update(tab.id, {
                        url: chrome.runtime.getURL('blocked.html')
                    });
                });
            });
        }
    });
    
    if (updated) {
        chrome.storage.sync.set({ websites: websites });
    }
}

// Block navigation to locked websites
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
    if (!isEnabled) return;
    
    try {
        const url = new URL(details.url);
        const hostname = url.hostname.toLowerCase();
        
        // Check if this website is locked
        const website = websites.find(w => w.domain === hostname || hostname.endsWith('.' + w.domain));
        
        if (website && website.isLocked) {
            console.log(`Blocking navigation to locked website: ${website.domain}`);
            // Block the navigation
            chrome.tabs.update(details.tabId, {
                url: chrome.runtime.getURL('blocked.html')
            });
        }
    } catch (e) {
        console.log('Error in navigation blocking:', e);
    }
});

// Handle installation and updates
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        // Set default values for new installations
        chrome.storage.sync.set({
            websites: [],
            extensionEnabled: true
        });
    }
    
    // Setup periodic updates for new installations/updates
    startPeriodicUpdates();
});

// Listen for storage changes to update local websites array
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync' && changes.websites) {
        websites = changes.websites.newValue || [];
        console.log('Websites updated from storage:', websites);
    }
});

// Periodic cleanup of old data (older than 30 days)
setInterval(function() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let updated = false;
    
    websites.forEach(website => {
        const addedDate = new Date(website.addedDate);
        if (addedDate < thirtyDaysAgo) {
            // Reset old website data
            website.timeSpent = 0;
            website.isLocked = false;
            website.addedDate = new Date().toDateString();
            website.lastUpdateTime = null;
            updated = true;
        }
    });
    
    if (updated) {
        chrome.storage.sync.set({ websites: websites });
    }
}, 24 * 60 * 60 * 1000); // Run once per day 