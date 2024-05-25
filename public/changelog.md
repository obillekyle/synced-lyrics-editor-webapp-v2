### **May 25, 2024**

**v2.0.7a_2**: PWA Hotfix

<ins>v2.0.7a ... v2.0.7a_2</ins>

**Changes:**
- App: Bump version code (9).
- App: Fixed for offline PWA staying at the splash screen.
- App: Added a one-time startup homepage.
- Keybinds: Added tab switching keybinds, you can see them at the keybinds screen — <kbd>CTRL + /</kbd>.
- Download: Fixed the title chip toggles the artist chip instead of itself.
- Fixed navigation bar incorrectly handle state changes.
- Improve resource caching.
- Updated meta tags.
- Added MIT license

### **May 23, 2024**

**v2.0.7a**: QoL changes

**Changes:**

<ins>v2.0.6a ... v2.0.7a</ins>

- App: Added session saving, all of your changes will be saved to locally and reloaded when you revisit the site.
- App: You can now install the app as a PWA, so you can use this site as an offline app.
- App: Adjusted app sizes.
- App: Adjusted app colors.
- App: Performance improvements.
- Preview: Cache all translated lyrics.
- Timing: Added a new screen mode for timing 'list'. From here you can delete lines faster by swiping a line left or right.
- Settings: Added new language: Filipino.
- Settings: 'showKeybinds' is now disabled by default.

**Other:**

- App: Bump version code (8)
- App: Added robots.txt.
- App: Adjusted colors logic.
- App: Added a manifest.json file and a service worker.
- App: Improved lighthouse scores.
- Element: Added new components 'Select'.
- Element: Renamed 'ProgressSpinner' to 'CircularProgress' and 'LineProgress' to 'LinearProgress'.
- Element: Added new component states useMD3 for 'Slider', 'CircularProgress', and 'LinearProgress' components.
- Events: Adjusted types.
- FileManager: Added a new FileManager class.
- Screen: Added new screen mode 'files'.
- Parser: Added 'id' property to every lines.
- Parser: renamed 'getJSON' to 'getRaw' and created a new 'getJSON' function.
- Player: Fixed 'reset' event not being called when player is resetted.

### **May 17, 2024**

**v2.0.6a**: Translatable preview lyrics

**Changes:**

<ins>v2.0.5a ... v2.0.6a</ins>

- App: Adjusted app colors
- Preview: Added a translate toggle
- Settings: Fixed entry toggles
- Editor: Returned textarea as default editor, you can still use the code editor by toggling it in the settings -> miscellaneous -> experimental

**Other:**

- App: Bump version code (7)
- App: Adjusted colors logic
- URL: Added query parameters 'l' and 's'
  - `l`: string = lyrics string
  - `s`: number = screen id (0 = edit, 1 = timing, 2 = lyric, 3 = debug)
- Element: Added new components 'MasterSwitch', 'ProgressSpinner', 'LineProgress', 'AwaitedText'
- Element: New 'Navigation' label states 'hidden', 'always', 'active';

### **May 5, 2024**

**v2.0.5a**: Languages

**Changes:**

<ins>v2.0.4a_2 ... v2.0.5a</ins>

- App: Added loading screen
- App: Added debug mode
- App: Bump version code (6)
- Layout: Removed unused elements
- Settings: Add theme toggle
- Settings: Add debug toggle
- Settings: Add language selector
- Editor: Added statusbar
- Editor: Performance improvements
- Editor: Removed debug floater

### **April 22, 2024**

**v2.0.4b**: Hotfix v2

**Changes:**

<ins>v2.0.4a ... v2.0.4a_2</ins>

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
