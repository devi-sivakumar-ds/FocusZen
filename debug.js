// Debug script for website blocker extension
console.log('🔍 Debug script loaded');

// Function to check extension status
function checkExtensionStatus() {
    console.log('🔍 Checking extension status...');
    
    // Check if extension is accessible
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        console.log('✅ Chrome extension API available');
        
        // Check storage
        chrome.storage.sync.get(['extensionEnabled', 'websites'], function(result) {
            console.log('📦 Storage data:', result);
            
            const isEnabled = result.extensionEnabled !== false;
            const websites = result.websites || [];
            
            console.log('🔧 Extension enabled:', isEnabled);
            console.log('🌐 Websites tracked:', websites.length);
            
            websites.forEach((website, index) => {
                console.log(`🌐 Website ${index + 1}:`, {
                    domain: website.domain,
                    timeLimit: website.timeLimit,
                    timeSpent: website.timeSpent,
                    isLocked: website.isLocked,
                    addedDate: website.addedDate
                });
            });
        });
        
        // Check active tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                const tab = tabs[0];
                console.log('📑 Active tab:', {
                    id: tab.id,
                    url: tab.url,
                    hostname: new URL(tab.url).hostname
                });
            }
        });
        
    } else {
        console.log('❌ Chrome extension API not available');
    }
}

// Function to test time tracking
function testTimeTracking() {
    console.log('⏰ Testing time tracking...');
    
    chrome.storage.sync.get(['websites'], function(result) {
        const websites = result.websites || [];
        const currentDomain = window.location.hostname.toLowerCase();
        
        console.log('🎯 Current domain:', currentDomain);
        
        const website = websites.find(w => 
            w.domain === currentDomain || currentDomain.endsWith('.' + w.domain)
        );
        
        if (website) {
            console.log('🎯 Found tracked website:', website);
            
            // Simulate time update
            const newTimeSpent = website.timeSpent + 1;
            website.timeSpent = newTimeSpent;
            
            chrome.storage.sync.set({ websites: websites }, function() {
                console.log(`⏰ Updated time for ${website.domain}: ${newTimeSpent}m`);
                checkExtensionStatus();
            });
        } else {
            console.log('❌ Current domain not tracked');
        }
    });
}

// Function to add test website
function addTestWebsite() {
    console.log('➕ Adding test website...');
    
    const testWebsite = {
        domain: window.location.hostname.toLowerCase(),
        timeLimit: 2, // 2 minutes
        timeSpent: 0,
        isLocked: false,
        addedDate: new Date().toDateString(),
        lastUpdateTime: null
    };
    
    chrome.storage.sync.get(['websites'], function(result) {
        const websites = result.websites || [];
        
        // Check if already exists
        if (websites.some(w => w.domain === testWebsite.domain)) {
            console.log('⚠️ Website already exists');
            return;
        }
        
        websites.push(testWebsite);
        
        chrome.storage.sync.set({ websites: websites }, function() {
            console.log('✅ Test website added:', testWebsite);
            checkExtensionStatus();
        });
    });
}

// Function to reset test website
function resetTestWebsite() {
    console.log('🔄 Resetting test website...');
    
    chrome.storage.sync.get(['websites'], function(result) {
        const websites = result.websites || [];
        const currentDomain = window.location.hostname.toLowerCase();
        
        const website = websites.find(w => 
            w.domain === currentDomain || currentDomain.endsWith('.' + w.domain)
        );
        
        if (website) {
            website.timeSpent = 0;
            website.isLocked = false;
            website.lastUpdateTime = null;
            
            chrome.storage.sync.set({ websites: websites }, function() {
                console.log('✅ Test website reset');
                checkExtensionStatus();
            });
        }
    });
}

// Function to force lock test website
function forceLockTestWebsite() {
    console.log('🔒 Forcing lock on test website...');
    
    chrome.storage.sync.get(['websites'], function(result) {
        const websites = result.websites || [];
        const currentDomain = window.location.hostname.toLowerCase();
        
        const website = websites.find(w => 
            w.domain === currentDomain || currentDomain.endsWith('.' + w.domain)
        );
        
        if (website) {
            website.timeSpent = website.timeLimit;
            website.isLocked = true;
            
            chrome.storage.sync.set({ websites: websites }, function() {
                console.log('✅ Test website locked');
                checkExtensionStatus();
                
                // Try to redirect to blocked page
                setTimeout(() => {
                    window.location.href = chrome.runtime.getURL('blocked.html');
                }, 1000);
            });
        }
    });
}

// Add debug functions to window
window.debugExtension = {
    checkStatus: checkExtensionStatus,
    testTimeTracking: testTimeTracking,
    addTestWebsite: addTestWebsite,
    resetTestWebsite: resetTestWebsite,
    forceLock: forceLockTestWebsite
};

// Auto-check on load
setTimeout(checkExtensionStatus, 1000);

// Add debug buttons to page
function addDebugButtons() {
    const debugDiv = document.createElement('div');
    debugDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
    `;
    
    debugDiv.innerHTML = `
        <div style="margin-bottom: 10px;"><strong>🔍 Debug Panel</strong></div>
        <button id="debug-check-status" style="margin: 2px; padding: 5px;">Check Status</button><br>
        <button id="debug-add-site" style="margin: 2px; padding: 5px;">Add Test Site</button><br>
        <button id="debug-test-timer" style="margin: 2px; padding: 5px;">Test Timer</button><br>
        <button id="debug-reset" style="margin: 2px; padding: 5px;">Reset</button><br>
        <button id="debug-force-lock" style="margin: 2px; padding: 5px;">Force Lock</button>
    `;
    
    document.body.appendChild(debugDiv);
    
    // Add event listeners to debug buttons
    document.getElementById('debug-check-status').addEventListener('click', checkExtensionStatus);
    document.getElementById('debug-add-site').addEventListener('click', addTestWebsite);
    document.getElementById('debug-test-timer').addEventListener('click', testTimeTracking);
    document.getElementById('debug-reset').addEventListener('click', resetTestWebsite);
    document.getElementById('debug-force-lock').addEventListener('click', forceLockTestWebsite);
}

// Add debug panel when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addDebugButtons);
} else {
    addDebugButtons();
}

console.log('🔍 Debug script ready. Use debugExtension object in console.'); 