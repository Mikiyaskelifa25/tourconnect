export const LANGUAGES = [
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'so', name: 'Somali', flag: '🇸🇴' },
] as const

export const DESTINATIONS = [
  { name: 'Addis Ababa', icon: '🌆' },
  { name: 'Lalibela', icon: '🏛️' },
  { name: 'Gondar', icon: '🏰' },
  { name: 'Aksum', icon: '⛩️' },
  { name: 'Bahir Dar', icon: '🌊' },
  { name: 'Harar', icon: '🏘️' },
  { name: 'Dire Dawa', icon: '🏙️' },
  { name: 'Mekele', icon: '🏔️' },
  { name: 'Simien Mountains', icon: '🏔️' },
  { name: 'Bale Mountains', icon: '🌿' },
  { name: 'Danakil Depression', icon: '🌋' },
  { name: 'Omo Valley', icon: '🌍' },
  { name: 'Tigray Rock Churches', icon: '⛪' },
  { name: 'Lake Tana Monasteries', icon: '⛵' },
  { name: 'Blue Nile Falls', icon: '💧' },
  { name: 'Arba Minch', icon: '🌅' },
  { name: 'Jinka', icon: '🏕️' },
  { name: 'Sof Omar Caves', icon: '🕳️' },
  { name: 'Awash National Park', icon: '🦁' },
  { name: 'Nechisar National Park', icon: '🦒' },
  { name: 'Debre Damo', icon: '⛰️' },
  { name: 'Debre Libanos', icon: '⛪' },
] as const

export function getLanguageName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.name || code.toUpperCase()
}

export function getLanguageFlag(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.flag || '🌐'
}
