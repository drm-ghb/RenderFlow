// Shared module-level store for unread comment tracking.
// Module-level variables survive SPA navigation (component remounts) in the same browser session.
// All components (ListDetail, ShareListClient, ListyView) import from here to avoid double-counting.

const _unreadByList: Record<string, Set<string>> = {};

export function getUnreadSet(listId: string): Set<string> {
  if (!_unreadByList[listId]) _unreadByList[listId] = new Set();
  return _unreadByList[listId];
}

export function syncListUnread(listId: string) {
  const count = getUnreadSet(listId).size;
  if (count > 0) {
    localStorage.setItem(`lc_list_unread_${listId}`, "1");
    localStorage.setItem(`lc_list_unread_count_${listId}`, String(count));
  } else {
    localStorage.removeItem(`lc_list_unread_${listId}`);
    localStorage.removeItem(`lc_list_unread_count_${listId}`);
  }
}
