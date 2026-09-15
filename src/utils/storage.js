// Storage keys
const PRESET_KEY = 'formpulse_user_preset';
const HISTORY_KEY = 'formpulse_submission_history';

export const DEFAULT_PRESET = {
  // Wallet objects list: [{ address: "0x...", enabled: true }]
  walletList: [],
  // Optional fixed handles (if empty, auto-generates dynamically)
  fixedTwitter: '',
  fixedTelegram: '',
  fixedEmail: '',
  fixedName: '',
  fixedDiscord: ''
};

export function loadUserPreset() {
  try {
    const data = localStorage.getItem(PRESET_KEY);
    if (!data) return DEFAULT_PRESET;
    const parsed = JSON.parse(data);

    let walletList = [];
    if (parsed && Array.isArray(parsed.walletList)) {
      walletList = parsed.walletList;
    } else if (parsed && Array.isArray(parsed.walletAddresses)) {
      walletList = parsed.walletAddresses.map(addr => ({ address: addr, enabled: true }));
    }

    return {
      ...DEFAULT_PRESET,
      ...parsed,
      walletList
    };
  } catch (e) {
    console.error('Failed to load user preset', e);
    return DEFAULT_PRESET;
  }
}

export function saveUserPreset(preset) {
  try {
    localStorage.setItem(PRESET_KEY, JSON.stringify(preset));
  } catch (e) {
    console.error('Failed to save user preset', e);
  }
}

export function loadSubmissionHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load history', e);
    return [];
  }
}

export function addSubmissionRecord(record) {
  try {
    const history = loadSubmissionHistory();
    const newHistory = [
      {
        id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        timestamp: new Date().toISOString(),
        ...record
      },
      ...history
    ].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    return newHistory;
  } catch (e) {
    console.error('Failed to save history record', e);
    return [];
  }
}

export function clearSubmissionHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return [];
  } catch (e) {
    return [];
  }
}
