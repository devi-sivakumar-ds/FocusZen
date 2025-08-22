document.addEventListener('DOMContentLoaded', function() {
    const siteInput = document.getElementById('siteInput');
    const timeLimitInput = document.getElementById('timeLimitInput');
    const addSiteBtn = document.getElementById('addSiteBtn');
    const websitesList = document.getElementById('websitesList');
    const totalWebsites = document.getElementById('totalWebsites');
    const lockedWebsites = document.getElementById('lockedWebsites');
    const activeWebsites = document.getElementById('activeWebsites');
    const extensionToggle = document.getElementById('extensionToggle');
    
    let updateInterval = null;
    
    // Load initial data
    loadWebsites();
    loadStats();
    loadExtensionState();
    
    // Start real-time updates
    startRealTimeUpdates();
    
    // Event listeners
    addSiteBtn.addEventListener('click', addWebsite);
    siteInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addWebsite();
        }
    });
    
    extensionToggle.addEventListener('change', toggleExtension);
    
    function startRealTimeUpdates() {
        // Update every 10 seconds for more responsive feel
        updateInterval = setInterval(function() {
            loadWebsites();
            loadStats();
            console.log('Popup: Periodic update triggered');
        }, 10000);
        
        // Also update when popup becomes visible
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                loadWebsites();
                loadStats();
                console.log('Popup: Visibility change update triggered');
            }
        });
        
        // Force immediate update
        setTimeout(function() {
            loadWebsites();
            loadStats();
            console.log('Popup: Initial update triggered');
        }, 1000);
    }
    
    function addWebsite() {
        const site = siteInput.value.trim().toLowerCase();
        const timeLimit = parseInt(timeLimitInput.value);
        
        if (!site) {
            showNotification('Please enter a website URL', 'error');
            return;
        }
        
        if (!timeLimit || timeLimit < 1 || timeLimit > 1440) {
            showNotification('Please enter a valid time limit (1-1440 minutes)', 'error');
            return;
        }
        
        // Normalize the URL (remove protocol, www, etc.)
        const normalizedSite = normalizeUrl(site);
        
        if (normalizedSite === '') {
            showNotification('Please enter a valid website URL', 'error');
            return;
        }
        
        // Check if site is already added
        chrome.storage.sync.get(['websites'], function(result) {
            const websites = result.websites || [];
            
            if (websites.some(w => w.domain === normalizedSite)) {
                showNotification('This website is already added', 'error');
                return;
            }
            
            // Add the website with time limit
            const newWebsite = {
                domain: normalizedSite,
                timeLimit: timeLimit,
                timeSpent: 0,
                isLocked: false,
                addedDate: new Date().toDateString(),
                lastUpdateTime: null
            };
            
            websites.push(newWebsite);
            
            chrome.storage.sync.set({ websites: websites }, function() {
                siteInput.value = '';
                timeLimitInput.value = '30';
                loadWebsites();
                loadStats();
                showNotification('Website added successfully!', 'success');
            });
        });
    }
    
    function removeWebsite(domain) {
        chrome.storage.sync.get(['websites'], function(result) {
            const websites = result.websites || [];
            const updatedWebsites = websites.filter(w => w.domain !== domain);
            
            chrome.storage.sync.set({ websites: updatedWebsites }, function() {
                loadWebsites();
                loadStats();
                showNotification('Website removed successfully!', 'success');
            });
        });
    }
    
    function resetWebsite(domain) {
        chrome.storage.sync.get(['websites'], function(result) {
            const websites = result.websites || [];
            const website = websites.find(w => w.domain === domain);
            
            if (website) {
                website.timeSpent = 0;
                website.isLocked = false;
                website.lastUpdateTime = null;
                
                chrome.storage.sync.set({ websites: websites }, function() {
                    loadWebsites();
                    loadStats();
                    showNotification('Website reset successfully!', 'success');
                });
            }
        });
    }
    
    function loadWebsites() {
        console.log('Popup: Loading websites...');
        chrome.storage.sync.get(['websites'], function(result) {
            const websites = result.websites || [];
            console.log('Popup: Loaded websites from storage:', websites);
            
            if (websites.length === 0) {
                websitesList.innerHTML = `
                    <div class="empty-state">
                        <p>No websites added yet</p>
                        <p>Add a website above to get started</p>
                    </div>
                `;
            } else {
                const today = new Date().toDateString();
                console.log('Popup: Today is:', today);
                
                const websiteItems = websites.map(website => {
                    console.log('Popup: Processing website:', website);
                    
                    // Check if we need to reset daily time
                    if (website.addedDate !== today) {
                        console.log(`Popup: Resetting daily time for ${website.domain}`);
                        website.timeSpent = 0;
                        website.isLocked = false;
                        website.addedDate = today;
                    }
                    
                    // Determine status
                    let statusClass = '';
                    let statusText = '';
                    
                    if (website.isLocked) {
                        statusClass = 'locked';
                        statusText = 'LOCKED';
                        console.log(`Popup: Website ${website.domain} is locked`);
                    } else if (website.timeSpent >= website.timeLimit * 0.8) {
                        statusClass = 'warning';
                        statusText = 'WARNING';
                        console.log(`Popup: Website ${website.domain} is in warning zone`);
                    }
                    
                    const timeRemaining = Math.max(0, website.timeLimit - website.timeSpent);
                    const timeDisplay = `${website.timeSpent}m / ${website.timeLimit}m`;
                    
                    // Add progress bar
                    const progressPercent = Math.min(100, (website.timeSpent / website.timeLimit) * 100);
                    const progressBar = `
                        <div class="progress-bar">
                            <div class="progress-fill ${statusClass}" style="width: ${progressPercent}%"></div>
                        </div>
                    `;
                    
                    return `
                        <div class="website-item ${statusClass}">
                            <div class="website-info">
                                <div class="website-url">${website.domain}</div>
                                <div class="website-time">${timeDisplay} (${timeRemaining}m left)</div>
                                ${progressBar}
                            </div>
                            <div class="website-actions">
                                <button class="reset-btn" onclick="resetWebsite('${website.domain}')" title="Reset daily time">Reset</button>
                                <button class="remove-btn" onclick="removeWebsite('${website.domain}')" title="Remove website">Remove</button>
                            </div>
                        </div>
                    `;
                }).join('');
                
                websitesList.innerHTML = websiteItems;
                
                // Save updated websites with reset times
                chrome.storage.sync.set({ websites: websites }, function() {
                    console.log('Popup: Saved updated websites to storage');
                });
            }
        });
    }
    
    function loadStats() {
        chrome.storage.sync.get(['websites'], function(result) {
            const websites = result.websites || [];
            const today = new Date().toDateString();
            
            let lockedCount = 0;
            let activeCount = 0;
            
            websites.forEach(website => {
                if (website.addedDate === today) {
                    if (website.isLocked) {
                        lockedCount++;
                    } else {
                        activeCount++;
                    }
                }
            });
            
            totalWebsites.textContent = websites.length;
            lockedWebsites.textContent = lockedCount;
            activeWebsites.textContent = activeCount;
        });
    }
    
    function loadExtensionState() {
        chrome.storage.sync.get(['extensionEnabled'], function(result) {
            const enabled = result.extensionEnabled !== false; // Default to true
            extensionToggle.checked = enabled;
        });
    }
    
    function toggleExtension() {
        const enabled = extensionToggle.checked;
        
        chrome.storage.sync.set({ extensionEnabled: enabled }, function() {
            showNotification(
                enabled ? 'Extension activated!' : 'Extension deactivated!', 
                enabled ? 'success' : 'warning'
            );
            
            // Send message to background script
            chrome.runtime.sendMessage({ 
                action: 'toggleExtension', 
                enabled: enabled 
            });
        });
    }
    
    function normalizeUrl(url) {
        // Remove protocol, www, and trailing slashes
        let normalized = url.replace(/^https?:\/\//, '');
        normalized = normalized.replace(/^www\./, '');
        normalized = normalized.replace(/\/$/, '');
        
        // Only allow valid domain characters
        if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(normalized)) {
            return '';
        }
        
        return normalized;
    }
    
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        // Set background color based on type
        switch(type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ffc107';
                notification.style.color = '#333';
                break;
            default:
                notification.style.backgroundColor = '#17a2b8';
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Cleanup when popup is closed
    window.addEventListener('beforeunload', function() {
        if (updateInterval) {
            clearInterval(updateInterval);
        }
    });
    
    // Make functions globally accessible
    window.removeWebsite = removeWebsite;
    window.resetWebsite = resetWebsite;
}); 