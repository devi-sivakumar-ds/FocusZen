# Website Blocker Extension - Testing Guide

## Issues Fixed

The following issues have been resolved in your website blocker extension:

1. **Timer not updating in real-time** ✅
2. **Website not getting locked when time expires** ✅
3. **Background script time tracking improvements** ✅
4. **Real-time UI updates** ✅

## How to Test

### 1. Reload the Extension
1. Go to `chrome://extensions/`
2. Find your "ZenFocus" extension
3. Click the refresh/reload button
4. Make sure the extension is enabled

### 2. Test with a Short Time Limit
1. Open the extension popup
2. Add a website with a very short time limit (1-2 minutes)
3. Navigate to that website
4. Stay on the page and watch the timer count down

### 3. Verify Timer Updates
- The popup should update every 30 seconds automatically
- Time spent should increase while you're on the website
- Progress bar should fill up as time progresses

### 4. Test Locking Functionality
- When time limit is reached, the website should automatically redirect to blocked.html
- The website should show as "LOCKED" in the extension popup
- Any attempt to navigate to the locked website should be blocked

## Key Improvements Made

### Background Script (`background.js`)
- Added periodic time updates every minute using Chrome alarms
- Improved active tab time tracking
- Better website locking logic
- Real-time time updates for active tabs

### Popup Script (`popup.js`)
- Real-time updates every 30 seconds
- Progress bars for visual time tracking
- Better time display and status indicators
- Automatic refresh when popup becomes visible

### Content Script (`content.js`)
- Enhanced blocking detection for time-limited websites
- Better integration with the blocking system

### Styling (`styles.css`)
- Added progress bar styles
- Visual indicators for different website states

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Can add websites with time limits
- [ ] Timer updates in real-time while browsing
- [ ] Progress bar fills up as time progresses
- [ ] Website gets locked when time limit is reached
- [ ] Blocked page displays correctly
- [ ] Locked websites show correct status in popup
- [ ] Can reset website timers
- [ ] Daily reset works correctly

## Troubleshooting

### If timer still doesn't update:
1. Check browser console for errors
2. Verify extension permissions include "alarms"
3. Make sure the extension is reloaded after changes

### If websites don't get locked:
1. Check that the time limit is set correctly
2. Verify the extension is enabled
3. Check that you're on the correct domain

### If blocked page doesn't show:
1. Check that blocked.html exists in the extension directory
2. Verify content script is running on the page
3. Check browser console for navigation errors

## Test Page

Use the included `test.html` file to test the extension:
1. Open `test.html` in your browser
2. Add the domain to your extension with a short time limit
3. Watch the real-time status updates
4. Verify blocking works when time expires

## Expected Behavior

- **Active browsing**: Timer should update every minute
- **Popup updates**: Should refresh every 30 seconds
- **Time limit reached**: Website should immediately redirect to blocked page
- **Locked status**: Should persist until daily reset or manual reset
- **Progress bars**: Should fill up proportionally to time spent 