// Content script for additional blocking functionality
(function() {
    'use strict';
    
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
        
        overlay.innerHTML = `
            <div style="max-width: 500px; padding: 40px;">
                <h1 style="font-size: 48px; margin-bottom: 20px;">🚫</h1>
                <h2 style="font-size: 32px; margin-bottom: 16px; font-weight: 600;">Website Blocked</h2>
                <p style="font-size: 18px; margin-bottom: 24px; opacity: 0.9;">
                    This website has been blocked by the ZenFocus extension to help you achieve zen-like focus.
                </p>
                <div style="display: flex; gap: 16px; justify-content: center;">
                    <button id="go-back-btn" style="
                        padding: 12px 24px;
                        background: rgba(255, 255, 255, 0.2);
                        border: 2px solid rgba(255, 255, 255, 0.3);
                        border-radius: 8px;
                        color: white;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">Go Back</button>
                    <button id="manage-sites-btn" style="
                        padding: 12px 24px;
                        background: rgba(255, 255, 255, 0.9);
                        border: none;
                        border-radius: 8px;
                        color: #333;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">Manage Sites</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        overlay.querySelector('#go-back-btn').addEventListener('click', function() {
            window.history.back();
        });
        
        overlay.querySelector('#manage-sites-btn').addEventListener('click', function() {
            chrome.runtime.sendMessage({ action: 'openPopup' });
        });
        
        // Add hover effects
        const buttons = overlay.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                if (this.id === 'go-back-btn') {
                    this.style.background = 'rgba(255, 255, 255, 0.3)';
                } else {
                    this.style.background = 'rgba(255, 255, 255, 1)';
                }
            });
            
            button.addEventListener('mouseleave', function() {
                if (this.id === 'go-back-btn') {
                    this.style.background = 'rgba(255, 255, 255, 0.2)';
                } else {
                    this.style.background = 'rgba(255, 255, 255, 0.9)';
                }
            });
        });
        
        // Insert overlay
        document.body.appendChild(overlay);
        
        // Prevent scrolling
        document.body.style.overflow = 'hidden';
    }
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'checkBlocked') {
            checkIfBlocked();
            sendResponse({ success: true });
        }
    });
    
    // Run initial checks
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            checkIfBlocked();
            injectBlockingOverlay();
        });
    } else {
        checkIfBlocked();
        injectBlockingOverlay();
    }
    
    // Also check when the page changes (for SPA applications)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(() => {
                checkIfBlocked();
                injectBlockingOverlay();
            }, 100);
        }
    }).observe(document, { subtree: true, childList: true });
    
})(); 