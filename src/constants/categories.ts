// Categories used throughout the app
export const CATEGORIES = [
  'Giyim',
  'Aksesuar', 
  'Ayakkabı',
  'Çanta',
  'Elektronik',
  'Ev & Yaşam',
  'Spor',
  'Kitap',
  'Ev & Bahçe',
  'Moda & Giyim',
  'Otomobil',
  'Hobi & Oyun',
  'Spor & Outdoor',
  'Kitap & Müzik',
  'Bebek & Çocuk',
  'Antika & Sanat'
];

// Filter categories for the main feed (includes "All" option)
export const FILTER_CATEGORIES = ['Tümü', ...CATEGORIES.slice(0, 8)]; // Use the first 8 main categories

// Extended categories for listing creation
export const LISTING_CATEGORIES = CATEGORIES;

export default {
  CATEGORIES,
  FILTER_CATEGORIES,
  LISTING_CATEGORIES
};
