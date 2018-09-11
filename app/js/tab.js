/* @flow */

import settings from './settings';
import tabmanager from './tabmanager';

export function tabFuzzyMatchesTab(tabA: chrome$Tab, tabB: chrome$Tab) {
  return (
    tabA === tabB ||
    (tabA.id != null && tabB.id != null && tabA.id === tabB.id) ||
    (tabA.index === tabB.index &&
      tabA.favIconUrl === tabB.favIconUrl &&
      tabA.title === tabB.title &&
      tabA.url === tabB.url)
  );
}

export function isLocked(tab: chrome$Tab): boolean {
  const lockedTabs: Array<chrome$Tab> = (settings.get('lockedTabs'): any);
  console.log('lockedTabs', lockedTabs);
  const tabWhitelistMatch = tabmanager.getWhitelistMatch(tab.url);
  return (
    tab.pinned ||
    tabWhitelistMatch ||
    !!(tab.audible && settings.get('filterAudio')) ||
    lockedTabs.some(lockedTab => tabFuzzyMatchesTab(tab, lockedTab))
  );
}

export function isManuallyLockable(tab: chrome$Tab): boolean {
  const tabWhitelistMatch = tabmanager.getWhitelistMatch(tab.url);
  return !tab.pinned && !tabWhitelistMatch && !(tab.audible && settings.get('filterAudio'));
}

export function sessionFuzzyMatchesTab(session: chrome$Session, tab: chrome$Tab) {
  // Sessions' `lastModified` is only accurate to the second in Chrome whereas `closedAt` is
  // accurate to the millisecond. Convert to ms if needed.
  const lastModifiedMs =
    session.lastModified < 10000000000 ? session.lastModified * 1000 : session.lastModified;

  return (
    session.tab != null &&
    // Tabs with no favIcons have the value `undefined`, but once converted into a session the tab
    // has an empty string (`''`) as its favIcon value. Account for that case for "equality".
    //
    // Note: This does *not* use `tabFuzzyMatchesTab` because that function assumes it is not
    // dealing with "session" tabs, i.e. tabs that were already closed.
    (session.tab.favIconUrl === tab.favIconUrl ||
      (session.tab.favIconUrl === '' && tab.favIconUrl == null)) &&
    session.tab.title === tab.title &&
    session.tab.url === tab.url &&
    // Ensure the browser's last modified time is within 1s of Tab Wrangler's close to as a fuzzy,
    // but likely always correct, match.
    // $FlowFixMe
    Math.abs(lastModifiedMs - tab.closedAt) < 1000
  );
}
