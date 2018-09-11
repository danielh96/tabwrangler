/* @flow */
/* global TW */

import * as tabUtils from './tab';
import { exportData, importData } from './actions/importExportActions';
import {
  removeAllSavedTabs,
  removeSavedTabs,
  setSavedTabs,
  setTotalTabsRemoved,
  setTotalTabsUnwrangled,
  setTotalTabsWrangled,
} from './actions/localStorageActions';

type WrangleOption = 'exactURLMatch' | 'hostnameAndTitleMatch' | 'withDuplicates';

/**
 * Stores the tabs in a separate variable to log Last Accessed time.
 * @type {Object}
 */
const TabManager = {
  tabTimes: {}, // An array of tabId => timestamp

  closedTabs: {
    clear() {
      TW.store.dispatch(removeAllSavedTabs());
    },

    // @todo: move to filter system for consistency
    findPositionById(id: number): ?number {
      const { savedTabs } = TW.store.getState().localStorage;
      for (let i = 0; i < savedTabs.length; i++) {
        if (savedTabs[i].id === id) {
          return i;
        }
      }
      return null;
    },

    findPositionByURL(url: ?string = ''): number {
      return TW.store.getState().localStorage.savedTabs.findIndex(item => {
        return item.url === url && url != null;
      });
    },

    findPositionByHostnameAndTitle(url: string = '', title: string = ''): number {
      const hostB = new URL(url).hostname;
      return TW.store.getState().localStorage.savedTabs.findIndex(tab => {
        const hostA = new URL(tab.url || '').hostname;
        return hostA === hostB && tab.title === title;
      });
    },

    unwrangleTabs(sessionTabs: Array<{ session: ?chrome$Session, tab: chrome$Tab }>) {
      const { localStorage } = TW.store.getState();
      const installDate = localStorage.installDate;
      let countableTabsUnwrangled = 0;
      sessionTabs.forEach(sessionTab => {
        if (sessionTab.session == null || sessionTab.session.tab == null) {
          chrome.tabs.create({ active: false, url: sessionTab.tab.url });
        } else {
          chrome.sessions.restore(sessionTab.session.tab.sessionId);
        }

        // Count only those tabs closed after install date because users who upgrade will not have
        // an accurate count of all tabs closed. The updaters' install dates will be the date of
        // the upgrade, after which point TW will keep an accurate count of closed tabs.
        // $FlowFixMe
        if (sessionTab.tab.closedAt >= installDate) countableTabsUnwrangled++;
      });

      // Done opening them all, now get all of the restored tabs out of the store.
      TW.store.dispatch(removeSavedTabs(sessionTabs.map(sessionTab => sessionTab.tab)));

      const totalTabsUnwrangled = localStorage.totalTabsUnwrangled;
      TW.store.dispatch(setTotalTabsUnwrangled(totalTabsUnwrangled + countableTabsUnwrangled));
    },

    getURLPositionFilterByWrangleOption(option: WrangleOption): (tab: chrome$Tab) => number {
      if (option === 'hostnameAndTitleMatch') {
        return (tab: chrome$Tab): number => {
          return TabManager.closedTabs.findPositionByHostnameAndTitle(tab.url, tab.title);
        };
      } else if (option === 'exactURLMatch') {
        return (tab: chrome$Tab): number => {
          return TabManager.closedTabs.findPositionByURL(tab.url);
        };
      }

      // `'withDupes'` && default
      return () => {
        return -1;
      };
    },

    wrangleTabs(tabs: Array<Object>) {
      const maxTabs = TW.settings.get('maxTabs');
      let totalTabsWrangled = TW.store.getState().localStorage.totalTabsWrangled;
      const wrangleOption = TW.settings.get('wrangleOption');
      const findURLPositionByWrangleOption = this.getURLPositionFilterByWrangleOption(
        wrangleOption
      );

      let nextSavedTabs = TW.store.getState().localStorage.savedTabs.slice();
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i] === null) {
          console.log('Weird bug, backtrace this...');
        }

        const existingTabPosition = findURLPositionByWrangleOption(tabs[i]);
        const closingDate = new Date().getTime();

        if (existingTabPosition > -1) {
          nextSavedTabs.splice(existingTabPosition, 1);
        }

        tabs[i].closedAt = closingDate;
        nextSavedTabs.unshift(tabs[i]);
        totalTabsWrangled += 1;

        // Close it in Chrome.
        chrome.tabs.remove(tabs[i].id);
      }

      if (nextSavedTabs.length - maxTabs > 0) {
        nextSavedTabs = nextSavedTabs.splice(0, maxTabs);
      }

      TW.store.dispatch(setSavedTabs(nextSavedTabs));
      TW.store.dispatch(setTotalTabsWrangled(totalTabsWrangled));
    },
  },

  initTabs(tabs: Array<chrome$Tab>) {
    for (let i = 0; i < tabs.length; i++) {
      TabManager.updateLastAccessed(tabs[i]);
    }
  },

  /* Re-export so these can be executed in the context of the Tab Manager. */
  exportData,
  importData,
  tabUtils,

  /**
   * Wrapper function to get all tab times regardless of time inactive
   * @return {Array}
   */
  getAll() {
    return TabManager.getOlderThen();
  },

  /**
   * Returns tab times (hash of tabId : lastAccess)
   * @param time
   *  If null, returns all.
   * @return {Array}
   */
  getOlderThen(time?: number) {
    const ret = [];
    for (const i in this.tabTimes) {
      if (this.tabTimes.hasOwnProperty(i)) {
        if (!time || this.tabTimes[i] < time) {
          ret.push(parseInt(i, 10));
        }
      }
    }
    return ret;
  },

  getWhitelistMatch(url: ?string) {
    if (url == null) return false;

    const whitelist = TW.settings.get('whitelist');
    for (let i = 0; i < whitelist.length; i++) {
      if (url.indexOf(whitelist[i]) !== -1) {
        return whitelist[i];
      }
    }
    return false;
  },

  isWhitelisted(url: string) {
    return this.getWhitelistMatch(url) !== false;
  },

  lockTab(tab: chrome$Tab) {
    let lockedTabs = TW.settings.get('lockedTabs');
    lockedTabs = [...lockedTabs, tab];
    TW.settings.set('lockedTabs', lockedTabs);
  },

  // `addListener` intersection results in incorrect function type
  // $FlowFixMe
  removeTab(tabId: number) {
    const totalTabsRemoved = TW.store.getState().localStorage.totalTabsRemoved;
    TW.store.dispatch(setTotalTabsRemoved(totalTabsRemoved + 1));
    delete TabManager.tabTimes[tabId];
  },

  // `addListener` intersection results in incorrect function type
  // $FlowFixMe
  replaceTab(addedTabId: number, removedTabId: number) {
    TabManager.removeTab(removedTabId);
    TabManager.updateLastAccessed(addedTabId);
  },

  unlockTab(tab: chrome$Tab) {
    const lockedTabs = TW.settings.get('lockedTabs');
    const lockedTabIndex = lockedTabs.findIndex(lockedTab =>
      tabUtils.tabFuzzyMatchesTab(tab, lockedTab)
    );
    if (lockedTabIndex !== -1) {
      const nextLockedTabs = lockedTabs.slice();
      nextLockedTabs.splice(lockedTabIndex, 1);
      TW.settings.set('lockedTabs', nextLockedTabs);
    }
  },

  updateClosedCount() {
    let text;
    if (TW.settings.get('showBadgeCount')) {
      const savedTabsLength = TW.store.getState().localStorage.savedTabs.length;
      text = savedTabsLength.length === 0 ? '' : savedTabsLength.toString();
    } else {
      text = '';
    }
    chrome.browserAction.setBadgeText({ text });
  },

  // `addListener` intersection results in incorrect function type
  // $FlowFixMe
  updateLastAccessed(tabOrTabId: chrome$Tab | number | Array<chrome$Tab>) {
    let tabId;
    if (Array.isArray(tabOrTabId)) {
      tabOrTabId.map(TabManager.updateLastAccessed.bind(this));
      return;
    } else if (typeof tabOrTabId === 'number') {
      tabId = tabOrTabId;
    } else {
      tabId = tabOrTabId.id;
    }

    if (typeof tabId !== 'number') {
      console.log('Error: `tabId` is not an number', tabId);
      return;
    }

    TabManager.tabTimes[tabId] = new Date().getTime();
  },
};

export default TabManager;
