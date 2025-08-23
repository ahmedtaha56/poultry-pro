let lastFocusedTab = 'Home';
let prevFocusedTab = null;
let sellEntryFrom = null;

export const setLastFocusedTab = (tabName) => {
  if (tabName && tabName !== lastFocusedTab) {
    prevFocusedTab = lastFocusedTab;
    lastFocusedTab = tabName;
  } else if (!lastFocusedTab) {
    lastFocusedTab = tabName;
  }
};

export const getLastFocusedTab = () => lastFocusedTab;
export const getPrevFocusedTab = () => prevFocusedTab;

export const setSellEntryFrom = (tabName) => {
  sellEntryFrom = tabName;
};

export const getSellEntryFrom = () => sellEntryFrom;

export const clearSellEntryFrom = () => {
  sellEntryFrom = null;
};

export default {
  setLastFocusedTab,
  getLastFocusedTab,
  getPrevFocusedTab,
  setSellEntryFrom,
  getSellEntryFrom,
  clearSellEntryFrom,
};


