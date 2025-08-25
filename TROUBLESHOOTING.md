# 🚨 TROUBLESHOOTING: chrome-extension://invalid/ Error

## 🔴 **Problem:**
When time limit is exceeded, the page redirects to `chrome-extension://invalid/` instead of the proper blocked page.

## 🔍 **Root Cause:**
This usually happens when:
1. Extension isn't properly loaded/reloaded
2. `blocked.html` file is missing or corrupted
3. Extension ID changed after reload
4. Manifest issues

## ✅ **Solutions to Try:**

### **Solution 1: Force Reload Extension**
1. Go to `chrome://extensions/`
2. Find "ZenFocus" extension
3. **Disable** the extension
4. **Enable** the extension again
5. **Click the refresh/reload button** (🔄)
6. Test again

### **Solution 2: Complete Reinstall**
1. Go to `chrome://extensions/`
2. **Remove** the ZenFocus extension completely
3. **Close Chrome completely**
4. **Reopen Chrome**
5. **Drag the extension folder** into `chrome://extensions/`
6. **Enable** the extension
7. Test again

### **Solution 3: Check File Structure**
Make sure these files exist in your extension folder:
- ✅ `manifest.json`
- ✅ `background.js`
- ✅ `content.js`
- ✅ `popup.html`
- ✅ `popup.js`
- ✅ `blocked.html`
- ✅ `styles.css`
- ✅ `icon.svg`

### **Solution 4: Verify blocked.html**
1. Open `blocked.html` in a text editor
2. Make sure it's a valid HTML file
3. Check that it starts with `<!DOCTYPE html>`
4. Verify no syntax errors

## 🔧 **Debug Steps:**

### **Step 1: Check Console**
1. Open the test page
2. Press `F12` for Developer Tools
3. Go to **Console** tab
4. Look for messages starting with 🔒
5. Check if blocked URL is valid

### **Step 2: Check Extension Status**
1. Click the ZenFocus extension icon
2. Check if popup opens correctly
3. Verify websites are showing
4. Check if timer is updating

### **Step 3: Test URL Generation**
1. In console, type: `chrome.runtime.getURL('blocked.html')`
2. Should return: `chrome-extension://[ID]/blocked.html`
3. If it returns `chrome-extension://invalid/`, extension needs reload

## 🚀 **Quick Fix Commands:**

### **In Console (F12):**
```javascript
// Check if extension is accessible
typeof chrome !== 'undefined' && chrome.runtime

// Check blocked URL
chrome.runtime.getURL('blocked.html')

// Check extension ID
chrome.runtime.id
```

### **Expected Results:**
- ✅ `true` (extension accessible)
- ✅ `chrome-extension://[ID]/blocked.html` (valid URL)
- ✅ `[some-id]` (valid extension ID)

## 📋 **If Still Not Working:**

### **Check Extension Permissions:**
1. Go to `chrome://extensions/`
2. Click "Details" on ZenFocus
3. Verify these permissions:
   - Storage
   - Web Navigation
   - Tabs
   - Active Tab
   - Notifications
   - All URLs

### **Check Background Script:**
1. In `chrome://extensions/`
2. Click "Service Worker" under ZenFocus
3. Look for any error messages
4. Check if background script is running

### **Test with Simple Domain:**
1. Add a simple domain like "google.com"
2. Set time limit to 1 minute
3. Navigate to google.com
4. Wait for time to expire
5. Check what happens

## 🎯 **Most Likely Fix:**

**The extension needs to be completely reloaded.** This is the most common cause of the `chrome-extension://invalid/` error.

1. **Disable** extension
2. **Remove** extension
3. **Restart Chrome**
4. **Reinstall** extension
5. **Test again**

---

**Let me know what you see in the console and whether reloading the extension fixes the issue!** 🚀 