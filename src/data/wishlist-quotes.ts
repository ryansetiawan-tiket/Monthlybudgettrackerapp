/**
 * Wishlist Simulation Quotes - Super Kocak Edition 🎭
 * 
 * Quotes cycling untuk berbagai state di Wishlist Simulation:
 * - shortage: Kurang dana untuk beli semua wishlist
 * - affordable: Bisa beli semua wishlist
 * - empty: Belum ada wishlist sama sekali
 * 
 * Style: Casual Indonesia, self-deprecating humor, relatable AF
 */

export const wishlistQuotes = {
  // ❌ SHORTAGE STATE - Kurang dana buat borong semua
  shortage: [
    "Aduh, dompet lagi diet nih! Kurang {amount} buat borong semua. Semangat, Bos! 💪",
    "Uang belum cukup nih, kurang {amount} lagi. Sabar ya, wishlist sayang~ 🥺",
    "Kantong masih tipis, butuh {amount} lagi. Tapi gapapa, yang penting ada niat! 😅",
    "Budget masih ngos-ngosan {amount}. Nabung dulu gas poll! 🏃‍♂️💨",
    "Kurang {amount} nih buat jadi sultan sehari. Pelan-pelan aja, yang penting konsisten! 💸",
    "Dompet bilang: 'Tunggu {amount} lagi ya, Bro!' Sabar adalah kunci~ 🗝️",
    "Masih kurang {amount} buat party belanja. Tapi tenang, progress is progress! 📈",
    "Budget lagi loading {amount}... Patience level: maksimal! ⏳",
    "Shortage alert: {amount}! Tapi hey, at least udah dicatat kan? 📝✨",
    "Kurang {amount}, tapi semangat tetap 100%! You got this, bestie! 💪✨",
    "Dompet: 'Aku belum siap, kurang {amount} lagi.' Me: 'Oke, kita nabung!' 🐷",
    "Gap-nya {amount} doang kok. Dikit lagi, dikit lagi! (kata gue dari bulan lalu) 😂",
    "Budget challenge level: hard. Missing: {amount}. Difficulty: extreme! 🎮",
    "Kurang {amount}. Plot twist: ini character development finansial! 🎭",
    "Dompet ngomong: 'Boss, {amount} lagi ya!' Oke, challenge accepted! 🔥",
    "Shortage {amount}. Tapi chill aja, Rome wasn't built in a day! 🏛️",
    "Butuh {amount} lagi buat complete the mission. Loading... 🎯",
    "Kurang {amount}. Tapi gapapa, financial glow up takes time! ✨",
    "Budget masih nginep {amount} di belakang. Kejar pelan-pelan, Bos! 🏃",
    "Gap {amount}. Santai, yang penting tracking-nya on point! 📊💯"
  ],

  // ✅ AFFORDABLE STATE - Bisa beli semua!
  affordable: [
    "Sikat, Bro! Uangmu udah siap buat pesta belanja. Beli! Beli! Beli! 🛒✨",
    "Yeay, budgetnya cukup! Saatnya jadi sultan sehari! 👑💸",
    "Congrats! Dompet ready for action. Gas borong semua! 🎉🔥",
    "Uang aman, wishlist terpenuhi. Living the dream! 😎✨",
    "Budget check: ✅ PASSED! Time to treat yourself, Bos! 🎊",
    "Jackpot! Semua wishlist dalam jangkauan. Let's gooo! 🚀💰",
    "Mission possible! Budget cleared for takeoff! 🛫💳",
    "Dompet bilang: 'Ayo gas, gue ready!' SIKAT! 💪🛍️",
    "Sultan mode: ACTIVATED. Wishlist mode: COMPLETE! 🤴✨",
    "Budget surplus detected! Shopping spree incoming! 🎯🛒",
    "Yosh! Semua bisa dibeli. Character development: SUKSES! 🌟",
    "Finansial status: SIAP TEMPUR! Borong aja semuanya! ⚡💸",
    "Dompet: 'Bro, gue sanggup nih!' Oke, CHECKOUT! 🔥",
    "Budget unlocked! Achievement: Financial Ninja! 🥷💰",
    "Semua dalam budget! Saatnya manifestasi jadi realita! ✨🎁",
    "Green light everywhere! Shopping cart: ready to rumble! 🚦🛒",
    "Uang cukup, mood bagus. Perfect combo! 😄💳",
    "Budget approved! Time to make it rain! ☔💸",
    "All clear! Wishlist transformation: PENDING → REALITY! 🎪✨",
    "Dompet full power! Saatnya execute the plan! ⚡🎯"
  ],

  // 📭 EMPTY STATE - Belum ada wishlist
  empty: [
    "Wishlist masih kosong nih. Ayo dong, mimpi dulu kek! ✨",
    "Belum ada target? Yuk mulai dreaming! Dreams are free kok~ 💭",
    "Wishlist-nya mana, Bos? Jangan malu-malu, add aja! 🎯",
    "Kosong melompong nih. Tap tombol + dong buat mulai! ➕",
    "No wishlist detected! Ayo dong, what's your dream item? 🌟",
    "Masih blank? Saatnya manifestasi keinginan! 🔮",
    "Empty wishlist = unlimited possibilities! Mulai dari mana? 🚀",
    "Belum ada yang dipengenin? Impossible! Add dong! 😄",
    "Wishlist kosong? That's a crime! Ayo isi sekarang! 🎁",
    "Zona kosong detected. Time to fill it with dreams! 💫",
    "Halaman ini kesepian nih. Kasih teman dong (wishlist)! 🥺",
    "Nothing to see here... yet! Tap + untuk magic! ✨➕",
    "Wishlist-mu di mana? Ayo dong, jangan ditahan! 🎪",
    "Kosong? Boring! Let's add some spice! 🌶️✨",
    "Blank canvas detected! Paint your dreams here! 🎨",
    "No items? No problem! Start your journey here! 🗺️",
    "Empty = full of potential! What do you want? 🎯",
    "Wishlist zero. Ambisi: infinite! Ayo mulai! 🚀",
    "Belum ada apa-apa nih. Jangan shy-shy, add lah! 😊",
    "Kosong tapi penuh harapan! Isi sekarang yuk! 💝"
  ]
};

/**
 * Get random quote for a specific state
 */
export function getRandomWishlistQuote(
  state: 'shortage' | 'affordable' | 'empty',
  shortageAmount?: number
): string {
  const quotes = wishlistQuotes[state];
  const randomIndex = Math.floor(Math.random() * quotes.length);
  let quote = quotes[randomIndex];
  
  // Replace {amount} placeholder with actual shortage amount
  if (state === 'shortage' && shortageAmount !== undefined) {
    const formattedAmount = `Rp ${shortageAmount.toLocaleString('id-ID')}`;
    quote = quote.replace('{amount}', formattedAmount);
  }
  
  return quote;
}

/**
 * Get a different quote from the current one (for cycling)
 */
export function getNextWishlistQuote(
  state: 'shortage' | 'affordable' | 'empty',
  currentQuote: string,
  shortageAmount?: number
): string {
  const quotes = wishlistQuotes[state];
  
  // If only one quote available, return it
  if (quotes.length === 1) {
    return currentQuote;
  }
  
  let newQuote: string;
  let attempts = 0;
  const maxAttempts = 10; // Prevent infinite loop
  
  do {
    newQuote = getRandomWishlistQuote(state, shortageAmount);
    attempts++;
  } while (newQuote === currentQuote && attempts < maxAttempts);
  
  return newQuote;
}
