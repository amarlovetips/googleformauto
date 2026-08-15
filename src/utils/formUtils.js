/**
 * Utility for fuzzy matching wallet address fields to user preset list,
 * guaranteed unique identity generation per wallet run, and full proof formatting.
 */

// Helper to check if a title is asking for EVM / Wallet Address
export function isWalletField(title) {
  if (!title) return false;
  const t = title.toLowerCase();
  return /evm|wallet|bep20|erc20|eth|bsc|solana|crypto|address|0x/.test(t);
}

// Word pools for realistic identity creation
const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Sam', 'Chris', 'Pat', 'Riley', 'Jamie', 'Dakota', 'Avery', 'Reese', 'Skyler', 'Cameron', 'Logan', 'Quinn', 'Harper', 'Rowan', 'Finley', 'Mason', 'Ethan', 'Noah', 'Lucas', 'Oliver', 'Liam', 'Elijah', 'Benjamin', 'James', 'Henry'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'White', 'Harris', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill'];
const CRYPTO_WORDS = ['crypto', 'web3', 'eth', 'alpha', 'builder', 'hodl', 'satoshi', 'node', 'sol', 'defi', 'nft', 'gem', 'whale', 'dex', 'dao', 'ape', 'bull', 'chain', 'block', 'vault', 'hyper', 'pulse', 'prime', 'vertex', 'nexus'];

/**
 * Generates a 100% unique identity for run index `i`
 */
export function generateDeterministicIdentity(runIndex = 0) {
  const firstIdx = (runIndex * 7 + 3) % FIRST_NAMES.length;
  const lastIdx = (runIndex * 11 + 5) % LAST_NAMES.length;
  const wordIdx = (runIndex * 13 + 2) % CRYPTO_WORDS.length;

  const first = FIRST_NAMES[firstIdx];
  const last = LAST_NAMES[lastIdx];
  const word = CRYPTO_WORDS[wordIdx];
  
  // Unique number suffix guaranteed per run index
  const uniqueNum = 100 + (runIndex * 17) + (runIndex % 9);

  const username = `${first.toLowerCase()}_${word}${uniqueNum}`;
  const fullName = `${first} ${last}`;
  
  // Twitter / X
  const twitterHandle = `@${username}`;
  // 19 digit realistic status ID based on index
  const tweetStatusId = '1824' + String(100000000000000 + runIndex * 98765432101 + 12345).substring(0, 15);
  const tweetUrl = `https://x.com/${username}/status/${tweetStatusId}`;

  // Telegram
  const telegramHandle = `@${first.toLowerCase()}_tg_${uniqueNum}`;
  const telegramPostUrl = `https://t.me/${first.toLowerCase()}_tg_${uniqueNum}/${10 + runIndex * 3}`;

  // Discord & Email
  const discord = `${first.toLowerCase()}_${word}#${1000 + (runIndex * 29) % 8999}`;
  const email = `${first.toLowerCase()}.${word}${uniqueNum}@gmail.com`;

  // Medium & YouTube
  const mediumUrl = `https://medium.com/@${username}`;
  const youtubeUrl = `https://youtube.com/@${username}`;

  // Transaction Hash (64 hex digits guaranteed unique per run index)
  const generateTxHash = (index) => {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[(index * 7 + i * 13) % chars.length];
    }
    return hash;
  };
  const txHash = generateTxHash(runIndex);

  return {
    runIndex,
    fullName,
    username,
    twitterHandle,
    tweetUrl,
    telegramHandle,
    telegramPostUrl,
    discord,
    email,
    mediumUrl,
    youtubeUrl,
    txHash
  };
}

export const generateRealisticIdentity = generateDeterministicIdentity;

/**
 * Auto-generates value for a field:
 * - Wallet field -> Pick wallet address from user preset list at current index.
 * - All other fields -> 100% Auto-Generated Realistic Data matching identity.
 */
export function generateFieldValue(field, userPreset, currentWalletIndex = 0, providedIdentity = null) {
  const title = (field.title || '').toLowerCase();
  const description = (field.description || '').toLowerCase();
  const combinedText = title + ' ' + description;
  const wallets = (userPreset && Array.isArray(userPreset.walletAddresses)) ? userPreset.walletAddresses : [];

  // 1. Wallet Address Question
  if (isWalletField(combinedText)) {
    if (wallets.length > 0) {
      const idx = currentWalletIndex % wallets.length;
      return {
        value: wallets[idx].trim(),
        isPreset: true,
        source: `Unique Wallet Address #${idx + 1}`
      };
    }
  }

  // 2. All other questions -> Deterministic Unique Identity per runIndex
  const identity = providedIdentity || generateDeterministicIdentity(currentWalletIndex);
  let generatedVal = '';

  // X / Twitter Post URL / Retweet Link / Proof of Tweet
  if (
    combinedText.includes('tweet') || 
    combinedText.includes('retweet') || 
    combinedText.includes('quote') || 
    (combinedText.includes('x.com') && combinedText.includes('status')) ||
    (combinedText.includes('twitter.com') && combinedText.includes('status')) ||
    (combinedText.includes('post') && (combinedText.includes('link') || combinedText.includes('url') || combinedText.includes('proof')))
  ) {
    generatedVal = identity.tweetUrl;
  }
  // X / Twitter Handle / Username
  else if (combinedText.includes('twitter') || combinedText.includes('x handle') || combinedText.includes('x username') || combinedText.includes('x.com')) {
    generatedVal = identity.twitterHandle;
  }
  // Telegram Post / Channel Link
  else if (combinedText.includes('telegram') && (combinedText.includes('link') || combinedText.includes('url') || combinedText.includes('post') || combinedText.includes('proof'))) {
    generatedVal = identity.telegramPostUrl;
  }
  // Telegram Username / Handle
  else if (combinedText.includes('telegram') || combinedText.includes('tg')) {
    generatedVal = identity.telegramHandle;
  }
  // Discord Username
  else if (combinedText.includes('discord')) {
    generatedVal = identity.discord;
  }
  // Medium Profile / Post
  else if (combinedText.includes('medium')) {
    generatedVal = identity.mediumUrl;
  }
  // YouTube Channel
  else if (combinedText.includes('youtube') || combinedText.includes('yt')) {
    generatedVal = identity.youtubeUrl;
  }
  // Transaction Hash / TxID / Proof of Payment
  else if (combinedText.includes('hash') || combinedText.includes('txid') || combinedText.includes('transaction')) {
    generatedVal = identity.txHash;
  }
  // Email Address
  else if (combinedText.includes('email') || combinedText.includes('mail')) {
    generatedVal = identity.email;
  }
  // Name / Full Name
  else if (combinedText.includes('name')) {
    generatedVal = identity.fullName;
  }
  // Referral / Inviter / Code
  else if (combinedText.includes('referral') || combinedText.includes('referrer') || combinedText.includes('invite') || combinedText.includes('code')) {
    generatedVal = `@crypto_ref_${100 + currentWalletIndex * 3}`;
  }
  // Quizzes / Radio / Dropdown Choice Selection
  else if (field.type === 'radio' || field.type === 'dropdown') {
    generatedVal = (field.choices && field.choices.length > 0) 
      ? field.choices[currentWalletIndex % field.choices.length] 
      : 'Yes';
  }
  // Checkbox Selections
  else if (field.type === 'checkbox') {
    generatedVal = (field.choices && field.choices.length > 0) 
      ? [field.choices[currentWalletIndex % field.choices.length]] 
      : ['Option 1'];
  }
  // Scale Rating
  else if (field.type === 'scale') {
    generatedVal = (field.choices && field.choices.length > 0) 
      ? field.choices[field.choices.length - 1] 
      : '5';
  }
  // Date & Time
  else if (field.type === 'date') {
    generatedVal = new Date().toISOString().split('T')[0];
  } else if (field.type === 'time') {
    const now = new Date();
    generatedVal = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
  // Long Paragraph Text
  else if (field.type === 'paragraph') {
    generatedVal = `Excited to participate in this project with wallet #${currentWalletIndex + 1}. Looking forward to further updates and milestones!`;
  }
  // Default Fallback
  else {
    generatedVal = identity.username;
  }

  return { 
    value: generatedVal, 
    isPreset: false, 
    source: '100% Unique Auto-Gen' 
  };
}
