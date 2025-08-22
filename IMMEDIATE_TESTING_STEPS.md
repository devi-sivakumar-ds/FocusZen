# 🚨 IMMEDIATE TESTING STEPS - Website Blocker Extension

## 🔴 **CRITICAL: The extension is NOT working properly**

Follow these steps **EXACTLY** to identify and fix the issue:

## 📋 **Step 1: Reload Extension**
1. Go to `chrome://extensions/`
2. Find "ZenFocus" extension
3. Click the **refresh/reload button** (🔄)
4. Make sure it shows "Enabled"

## 📋 **Step 2: Open Test Page**
1. Open the `test.html` file in your browser
2. You should see a debug panel on the right side
3. Click "Check Extension Status" button
4. Look at the debug information below

## 📋 **Step 3: Check Console for Errors**
1. Press `F12` to open Developer Tools
2. Go to **Console** tab
3. Look for any **red error messages**
4. Look for messages starting with 🔍, ✅, ❌

## 📋 **Step 4: Test Basic Functionality**
1. Click "Add Test Website (2 min)" button
2. Click "Check Extension Status" again
3. You should see the website added
4. Click "Test Time Update" to manually increment time

## 📋 **Step 5: Check Extension Popup**
1. Click the ZenFocus extension icon in toolbar
2. Check if websites are showing
3. Look for any error messages
4. Check if timer values are updating

## 🔍 **What to Look For:**

### ✅ **Good Signs:**
- Console shows "✅ Chrome extension API available"
- Extension popup shows websites
- Debug info shows "Extension enabled: true"
- No red error messages

### ❌ **Bad Signs:**
- Console shows "❌ Chrome extension API not available"
- Extension popup is blank or shows errors
- Debug info shows "Extension not detected"
- Red error messages in console

## 🚨 **If Still Not Working:**

### **Check Extension Permissions:**
1. Go to `chrome://extensions/`
2. Click "Details" on ZenFocus
3. Make sure these permissions are granted:
   - Storage
   - Web Navigation
   - Tabs
   - Active Tab
   - All URLs

### **Check Background Script:**
1. In `chrome://extensions/`
2. Click "Service Worker" under ZenFocus
3. Look for any error messages
4. Check if background script is running

### **Test with Simple Domain:**
1. Add a simple domain like "google.com" (not localhost)
2. Set time limit to 1 minute
3. Navigate to google.com
4. Wait and see if it gets blocked

## 📞 **Report Back:**

Tell me exactly what you see:
1. What appears in the debug panel?
2. What errors (if any) in console?
3. What happens when you click the buttons?
4. Does the extension popup work?
5. Are websites being added to storage?

## 🔧 **Quick Fix Attempt:**

If nothing works, try this:
1. **Disable** the extension
2. **Delete** the extension completely
3. **Reinstall** by dragging the folder into `chrome://extensions/`
4. **Test again** with the steps above

---

**The issue is likely one of these:**
- Extension not properly reloaded
- Background script not running
- Storage permissions not working
- Content script not injecting
- Domain matching issues

**Let's fix this step by step!** 🚀 