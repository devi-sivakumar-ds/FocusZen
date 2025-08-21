document.addEventListener('DOMContentLoaded', function() {
    const siteInput = document.getElementById('siteInput');
    const addSiteBtn = document.getElementById('addSiteBtn');
    const blockedSitesList = document.getElementById('blockedSitesList');
    const totalBlocked = document.getElementById('totalBlocked');
    const todayBlocked = document.getElementById('todayBlocked');
    const extensionToggle = document.getElementById('extensionToggle');

    // Load initial data
    loadBlockedSites();
    loadStats();
    loadExtensionState();

    // Event listeners
    addSiteBtn.addEventListener('click', addSite);
    siteInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addSite();
        }
    });

    extensionToggle.addEventListener('change', toggleExtension);

    function addSite() {
        const site = siteInput.value.trim().toLowerCase();
        
        if (!site) {
            showNotification('Please enter a website URL', 'error');
            return;
        }

        // Normalize the URL (remove protocol, www, etc.)
        const normalizedSite = normalizeUrl(site);
        
        if (normalizedSite === '') {
            showNotification('Please enter a valid website URL', 'error');
            return;
        }

        // Check if site is already blocked
        chrome.storage.sync.get(['blockedSites'], function(result) {
            const blockedSites = result.blockedSites || [];
            
            if (blockedSites.includes(normalizedSite)) {
                showNotification('This website is already blocked', 'error');
                return;
            }

            // Add the site
            blockedSites.push(normalizedSite);
            
            chrome.storage.sync.set({ blockedSites: blockedSites }, function() {
                siteInput.value = '';
                loadBlockedSites();
                loadStats();
                showNotification('Website blocked successfully!', 'success');
                
                // Update today's count
                updateTodayCount();
            });
        });
    }

    function removeSite(site) {
        chrome.storage.sync.get(['blockedSites'], function(result) {
            const blockedSites = result.blockedSites || [];
            const updatedSites = blockedSites.filter(s => s !== site);
            
            chrome.storage.sync.set({ blockedSites: updatedSites }, function() {
                loadBlockedSites();
                loadStats();
                showNotification('Website unblocked successfully!', 'success');
            });
        });
    }

    function loadBlockedSites() {
        chrome.storage.sync.get(['blockedSites'], function(result) {
            const blockedSites = result.blockedSites || [];
            
            if (blockedSites.length === 0) {
                blockedSitesList.innerHTML = `
                    <div class="empty-state">
                        <p>No websites blocked yet</p>
                        <p>Add a website above to get started</p>
                    </div>
                `;
            } else {
                blockedSitesList.innerHTML = blockedSites.map(site => `
                    <div class="site-item">
                        <span class="site-url">${site}</span>
                        <button class="remove-btn" onclick="removeSite('${site}')">Remove</button>
                    </div>
                `).join('');
            }
        });
    }

    function loadStats() {
        chrome.storage.sync.get(['blockedSites', 'todayBlocked'], function(result) {
            const blockedSites = result.blockedSites || [];
            const todayBlockedCount = result.todayBlocked || 0;
            
            totalBlocked.textContent = blockedSites.length;
            todayBlocked.textContent = todayBlockedCount;
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

    function updateTodayCount() {
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
            }, function() {
                loadStats();
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

    // Make removeSite function globally accessible
    window.removeSite = removeSite;
}); 