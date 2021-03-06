[![Crowdin](https://d322cqt584bo4o.cloudfront.net/tab-wrangler/localized.svg)](https://crowdin.com/project/tab-wrangler)

# Tab Wrangler

A Chrome & Firefox extension that automatically closes tabs you haven't used in a while so you can
focus on the tabs that matter

* [Installation](#installation)
* [Features](#features)
* [Usage](#usage)
  * [Backup & Restore](#back-up--restore)
  * [Settings](#settings)
* [Privacy Policy](#privacy-policy)
* [Contributing](#contributing)
  * [Translation](#translation)
  * [Development](#development)

## Installation

* Tab Wrangler for Chrome:
  https://chrome.google.com/extensions/detail/egnjhciaieeiiohknchakcodbpgjnchh
* Tab Wrangler for Firefox: https://addons.mozilla.org/en-US/firefox/addon/tabwrangler/

## Features

* *The Corral*: Stores tabs which have been auto-closed so you can re-open as required.
* *Exclude list*: Provide the urls or domain names of the sites you never want auto-closed.
* *Tab Lock*: Pick open tabs to "lock".  Locked tabs will not be auto-closed.
* *Configurable*: Pick how long a tab should be considered ready to close and how many tabs should
  be open at a minimum.
* *Smart*: Doesn't autoclose pinned tabs, doesn't close all your tabs, just enough to make your
  browser usable.

## Usage

1. Click on the icon next to the URL bar
    * Tab Corral
      * Stores tabs which have been auto-closed. Restoring tabs with green leaf icons on their right
        sides will have their full history and scroll positions saved. (Full history restore is
        limited by the browser to the last 25 closed tabs.)
    * Tab Lock
      * Selectively lock tabs which you want to stay open.
      * See the time remaining before each tab will be checked for auto-closing.
    * Options
      * Whitelist certain URLs to never be closed.
      * Set the amount of time to wait before closing inactive tabs.
      * Set the ideal number of tabs to have in your browser.
      * Configure keyboard shortcuts.

### Back up & Restore

You can back up your list of closed tabs as well as the number of tabs Tab Wrangler has closed by
using the import/export functionality in the Settings tab.

#### Back up / Export

1. Open Tab Wrangler
2. Switch to the *Settings* tab
3. Scroll to *Import / Export*
4. Click *Export*

#### Restore / Import

If you previously backed up / exported your list of tabs, follow these steps to restore the list in
Tab Wrangler. **Note: this will overwrite Tab Wrangler's tabs list;** ensure you are not overwriting
tabs that you wanted to save.

1. Open Tab Wrangler
2. Switch to the *Settings* tab
3. Scroll to *Import / Export*
4. Click *Import*
5. Select the file created during back up, it will be named similarly to
   "TabWranglerExport-6-18-2017.json"

### Settings

Tab Wrangler's settings are saved and synced by your browser, like [Chrome sync][0] for example, to
all of your logged in browser sessions if you have sync enabled. Their possible values and their
usages are described in the following table:

| Setting               | Default                   | Possible Values                                             | Description                                                                                         |
| --------------------- | ------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `checkInterval`       | `5000`                    | `0` < `checkInterval`                                       | How often Tab Wrangler should check for stale tabs to close (in milliseconds)                       |
| `debounceOnActivated` | `false`                   |                                                             | Whether to wait 1 second before resetting the active tab's timer                                    |
| `filterAudio`         | `false`                   |                                                             | Whether to prevent auto-closing tabs that are playing audio                                         |
| `lockedIds`           | `[]`                      |                                                             | Array of tab IDs that have been explicitly locked by the user                                       |
| `maxTabs`             | `100`                     | `0` <= `maxTabs` <= `1000`                                  | Maximum number of tabs to keep in the tab list                                                      |
| `minTabs`             | `5`                       | `0` <= `minTabs`                                            | Auto-close tabs only if there are more than this number open                                        |
| `minutesInactive`     | `20`                      | `0` <= `minutesInactive`                                    | How much time (+ `secondsInactive`) before a tab is considered "stale" and ready to close           |
| `paused`              | `false`                   |                                                             | Whether TabWrangler is paused (shouldn't count down)                                                |
| `purgeClosedTabs`     | `false`                   |                                                             | Whether to empty the closed tab list when the browser closes                                        |
| `secondsInactive`     | `0`                       | `0` <= `secondsInactive`                                    | How much time (+ `minutesInactive`) before a tab is considered "stale" and ready to close           |
| `showBadgeCount`      | `true`                    |                                                             | Whether to show the length of the closed tab list as a badge on the URL bar icon                    |
| `whitelist`           | `['about:', 'chrome://']` |                                                             | Array of patterns to check against.  If a tab's URL matches a pattern, the tab is never auto-closed |
| `wrangleOption`       | `'withDupes'`             | `'exactURLMatch'`, `'hostnameAndTitleMatch'`, `'withDupes'` | How to handle duplicate entries in the closed tabs list                                             |

## Privacy Policy

Tab Wrangler does not transmit any data about you or your usage of Tab Wrangler. There is no
tracking, there are no analytics, and there are no advertisements.

## Contributing

### Translation

[Tab Wrangler's Crowdin Project][1]: the place to contribute and view translations

Tab Wrangler is available in other languages thanks to generous translation help. Any help
translating Tab Wrangler is greatly appreciated and can be done via Crowdin.

* 🇫🇷 French translation by [orpheuslummis](https://orpheuslummis.info)
* 🇩🇪 German translation by [ingorichter](https://github.com/ingorichter)
* 🇰🇷 Korean translation by [simple-is-best](https://github.com/simple-is-best)
* 🇷🇺 Russian translation by [Voknehzyr](https://github.com/Voknehzyr)

### Development

Pull requests for bug fixes and features are more than welcome. Please check out the
["Developing" section][2] of the CONTRIBUTING doc to see how to get started. Once your code is
working and tested, submit a pull request to this primary project and we'll get going.

* Modernized and maintained by [ssorallen](https://github.com/ssorallen) in 2017
* Rewritten by [JacobSingh](https://github.com/jacobSingh) in 2012
* Original extension and idea by [jacktasia](https://github.com/jacktasia) in 2010

[0]: https://chrome.google.com/sync
[1]: https://crowdin.com/project/tab-wrangler
[2]: CONTRIBUTING.md#developing
