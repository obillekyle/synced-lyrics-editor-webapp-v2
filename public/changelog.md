### **April 22, 2024**

**v2.0.4b**: Hotfix v2

**Changes:**

<ins>v2.0.4a ... v2.0.4b</ins>

- Editor: Added zooming.
- Editor: Better handling of IME input.
- Editor: Added tooltips on hover (tags only atm).
- App: Modified scrollbar style (Chromium only).
- App: Added input elements to the header (not working).
- App: Settings will now appear on smaller screens.
- App: Added the "ALPHA" tag
- Player: Fixed seeker unable to be clicked.

### **April 17, 2024**

**v2.0.4a**: Hotfix

**Changes:**

<ins>v2.0.3a ... v2.0.4a</ins>

- Timing: Fixed issue where the current time wont update on play button click.
- Editor: Fixed mouse selection
- Editor: Fixed values wont save on editor unfocus
- App: Revamped screen switcher, again
- App: Adjusted colors

**Known Bugs:**

- Almost all the bugs in the previous version

### **April 15, 2024**

**v2.0.3a**: Text editor and player changes

**Changes:**

<ins>v2.0.2a ... v2.0.3a</ins>

- Added a repeat button
- Added play button on timing entries
- Added settings screen (hover to the logo)
- Added mini player on mobile devices
- Replaced textarea with barely working text editor (because why not?)
- Revamped(?) screen switcher
- Fixed UI overflowing on small screens
- Fixed issue where there is a blank line at the end of the file
- Fixed issue where the timing bar would not update
- Properly handle invalid/unsupported files
- Performance improvements?

**Known Bugs:**

- Text editor almost unusable on mobile devices
- Switching from text editor to preview does not reflect changes
- Cut, Undo, Redo not working on text editor
- Unable to get selection using mouse
- Unable to open settings on mobile

### **March 7, 2024**

**v2.0.2a**: Hotfix

**Changes:**

<ins>v2.0.1a ... v2.0.2a</ins>

- Fixed hourglass button not switching focus to next line
- Fixed timing not working on mobile
- Prevented object mutation when updating a line.

### **March 7, 2024**

**v2.0.1a**: Initial Alpha release

Welcome to Synced Lyrics Editor v2

**Get Started**:

- Upload your music file by clicking the upload button at the bottom right
- Switch to Editor tab and paste in your lyrics or alternatively, upload a lrc file by clicking the file upload button at the top header bar.
- Switch to timing to sync your lyrics.
- Preview your lyrics at the preview tab.

**Changes:**

<ins>v1.0.2 ... v2.0.1a</ins>

- Switched over to Vue3
- Completely rewrite from scratch
- Used global stores and to prevent unwanted component updates
- Support for lyric tags
- Prevent unload when the audio finishes playing

**Missing Features:**

<ins>v.1.0.2 ... v2.0.1a</ins>

- Projects
- Mobile md theme
- Screen switch shortcuts
- Automatic session saving
