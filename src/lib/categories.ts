// Central Categories & Subcategories Taxonomy

export interface SubcategoryOption {
  id: string
  name_bn: string
  name_en: string
  slug: string
  is_active?: boolean
}

export interface CategoryOption {
  id: string
  name_bn: string
  name_en: string
  slug: string
  icon?: string
  display_order?: number
  is_active?: boolean
  subcategories: SubcategoryOption[]
}

export const DEFAULT_CATEGORIES: CategoryOption[] = [
  {
    id: 'electrical-services',
    name_bn: 'ইলেকট্রিক্যাল কাজ',
    name_en: 'Electrical Services',
    slug: 'electrical-services',
    icon: 'Zap',
    display_order: 1,
    is_active: true,
    subcategories: [
      { id: 'house-wiring', name_bn: 'বাসা-বাড়ির ওয়্যারিং', name_en: 'House Wiring', slug: 'house-wiring', is_active: true },
      { id: 'fan-lighting-fitting', name_bn: 'ফ্যান ও লাইটিং ফিটিং', name_en: 'Fan & Light Fitting', slug: 'fan-lighting-fitting', is_active: true },
      { id: 'switch-socket-repair', name_bn: 'সুইচ ও সকেট মেরামত', name_en: 'Switch Socket Repair', slug: 'switch-socket-repair', is_active: true },
      { id: 'db-breaker', name_bn: 'সার্কিট ব্রেকার ও ডিবি বোর্ড', name_en: 'Breaker & DB Board', slug: 'db-breaker', is_active: true },
      { id: 'ips-generator', name_bn: 'আইপিএস ও জেনারেটর সংযোগ', name_en: 'IPS & Generator Setup', slug: 'ips-generator', is_active: true },
      { id: 'submersible-motor', name_bn: 'সাব-মার্সিবল মোটর ওয়্যারিং', name_en: 'Submersible Motor Wiring', slug: 'submersible-motor', is_active: true },
    ],
  },
  {
    id: 'plumbing-services',
    name_bn: 'প্লাম্বিং সার্ভিস',
    name_en: 'Plumbing Services',
    slug: 'plumbing-services',
    icon: 'Wrench',
    display_order: 2,
    is_active: true,
    subcategories: [
      { id: 'pipe-fitting', name_bn: 'পাইপ ফিটিং ও মেরামত', name_en: 'Pipe Fitting', slug: 'pipe-fitting', is_active: true },
      { id: 'water-pump-repair', name_bn: 'পানির মোটর ও পাম্প মেরামত', name_en: 'Water Pump Repair', slug: 'water-pump-repair', is_active: true },
      { id: 'sanitary-fitting', name_bn: 'স্যানিটারি ও বাথরুম ফিটিংস', name_en: 'Sanitary Fitting', slug: 'sanitary-fitting', is_active: true },
      { id: 'tank-cleaning', name_bn: 'পানির ট্যাংক পরিষ্কার', name_en: 'Water Tank Cleaning', slug: 'tank-cleaning', is_active: true },
      { id: 'leak-repair', name_bn: 'পাইপলাইন লিকেজ সমাধান', name_en: 'Leak Repair', slug: 'leak-repair', is_active: true },
    ],
  },
  {
    id: 'painting-services',
    name_bn: 'রং করার কাজ',
    name_en: 'Painting Services',
    slug: 'painting-services',
    icon: 'Paintbrush',
    display_order: 3,
    is_active: true,
    subcategories: [
      { id: 'interior-paint', name_bn: 'ঘরের ভেতরের দেয়াল রং', name_en: 'Interior Wall Painting', slug: 'interior-paint', is_active: true },
      { id: 'exterior-weathercoat', name_bn: 'বাইরের দেয়াল ও ওয়েদারকোট', name_en: 'Exterior Weathercoat', slug: 'exterior-weathercoat', is_active: true },
      { id: 'putty-primer', name_bn: 'পুটিং ও প্রাইমার কাজ', name_en: 'Putty & Primer Work', slug: 'putty-primer', is_active: true },
      { id: 'wood-polish', name_bn: 'কাঠের বার্নিশ ও পলিশ', name_en: 'Wood Polish & Varnish', slug: 'wood-polish', is_active: true },
    ],
  },
  {
    id: 'masonry-services',
    name_bn: 'রাজমিস্ত্রীর কাজ',
    name_en: 'Masonry Services',
    slug: 'masonry-services',
    icon: 'Hammer',
    display_order: 4,
    is_active: true,
    subcategories: [
      { id: 'brick-laying', name_bn: 'ইট গাঁথুনি ও প্লাস্টার', name_en: 'Brick Laying & Plaster', slug: 'brick-laying', is_active: true },
      { id: 'tiles-marble', name_bn: 'টাইলস ও মার্বেল ফিটিংস', name_en: 'Tiles & Marble Fitting', slug: 'tiles-marble', is_active: true },
      { id: 'roof-casting', name_bn: 'ছাদ ঢালাই ও কংক্রিট কাজ', name_en: 'Roof Casting & Concrete', slug: 'roof-casting', is_active: true },
      { id: 'boundary-wall', name_bn: 'বাউন্ডারি ওয়াল নির্মাণ', name_en: 'Boundary Wall Construction', slug: 'boundary-wall', is_active: true },
    ],
  },
  {
    id: 'tin-roofing-services',
    name_bn: 'ঘরের টিনের কাজ',
    name_en: 'Tin Roofing Services',
    slug: 'tin-roofing-services',
    icon: 'Home',
    display_order: 5,
    is_active: true,
    subcategories: [
      { id: 'tinshed-construction', name_bn: 'টিনশেড নির্মাণ', name_en: 'Tin Shed Construction', slug: 'tinshed-construction', is_active: true },
      { id: 'roof-leak-repair', name_bn: 'টিনের চাল মেরামত ও লিকেজ বন্ধ', name_en: 'Roof Leak Repair', slug: 'roof-leak-repair', is_active: true },
      { id: 'steel-truss', name_bn: 'স্টিল ট্রাস কাজ', name_en: 'Steel Truss Work', slug: 'steel-truss', is_active: true },
    ],
  },
  {
    id: 'carpentry-services',
    name_bn: 'কাঠের কাজ',
    name_en: 'Carpentry Services',
    slug: 'carpentry-services',
    icon: 'Axe',
    display_order: 6,
    is_active: true,
    subcategories: [
      { id: 'door-window-frame', name_bn: 'দরজা-জানালার ফ্রেম', name_en: 'Door & Window Frame', slug: 'door-window-frame', is_active: true },
      { id: 'wooden-ceiling', name_bn: 'কাঠের সিলিং ডিজাইন', name_en: 'Wooden Ceiling Design', slug: 'wooden-ceiling', is_active: true },
      { id: 'modular-kitchen', name_bn: 'মডুলার কিচেন ক্যাবিনেট', name_en: 'Modular Kitchen Cabinet', slug: 'modular-kitchen', is_active: true },
    ],
  },
  {
    id: 'furniture-services',
    name_bn: 'ফার্নিচারের কাজ',
    name_en: 'Furniture Services',
    slug: 'furniture-services',
    icon: 'Armchair',
    display_order: 7,
    is_active: true,
    subcategories: [
      { id: 'furniture-assembly', name_bn: 'ফার্নিচার অ্যাসেম্বলি', name_en: 'Furniture Assembly', slug: 'furniture-assembly', is_active: true },
      { id: 'sofa-repair', name_bn: 'সোফা রিপেয়ার ও পলিশ', name_en: 'Sofa Repair & Polish', slug: 'sofa-repair', is_active: true },
      { id: 'custom-bed-wardrobe', name_bn: 'কাস্টম খাট ও ওয়ারড্রব', name_en: 'Custom Bed & Wardrobe', slug: 'custom-bed-wardrobe', is_active: true },
    ],
  },
  {
    id: 'metal-fabrication',
    name_bn: 'এঙ্গেল মিস্ত্রী ও গ্রিল',
    name_en: 'Metal Fabrication',
    slug: 'metal-fabrication',
    icon: 'ShieldAlert',
    display_order: 8,
    is_active: true,
    subcategories: [
      { id: 'window-veranda-grill', name_bn: 'জানালা ও বারান্দার গ্রিল', name_en: 'Window & Veranda Grill', slug: 'window-veranda-grill', is_active: true },
      { id: 'main-collapsible-gate', name_bn: 'মেইন গেট ও কলাপসিবল গেট', name_en: 'Main Gate & Collapsible Gate', slug: 'main-collapsible-gate', is_active: true },
      { id: 'metal-railing-welding', name_bn: 'মেটাল রেলিং ও ওয়েল্ডিং', name_en: 'Metal Railing & Welding', slug: 'metal-railing-welding', is_active: true },
    ],
  },
  {
    id: 'thai-glass-aluminium',
    name_bn: 'থাই গ্লাস ও অ্যালুমিনিয়াম',
    name_en: 'Thai Glass & Aluminium',
    slug: 'thai-glass-aluminium',
    icon: 'Layers',
    display_order: 9,
    is_active: true,
    subcategories: [
      { id: 'thai-sliding-window', name_bn: 'থাই স্লাইডিং জানালা', name_en: 'Thai Sliding Window', slug: 'thai-sliding-window', is_active: true },
      { id: 'glass-door-fitting', name_bn: 'গ্লাস ডোর ফিটিং', name_en: 'Glass Door Fitting', slug: 'glass-door-fitting', is_active: true },
      { id: 'aluminium-partition', name_bn: 'অ্যালুমিনিয়াম পার্টিশন', name_en: 'Aluminium Partition', slug: 'aluminium-partition', is_active: true },
    ],
  },
  {
    id: 'ceiling-services',
    name_bn: 'ঘরের সিলিং কাজ',
    name_en: 'Ceiling Services',
    slug: 'ceiling-services',
    icon: 'Maximize',
    display_order: 10,
    is_active: true,
    subcategories: [
      { id: 'false-ceiling-design', name_bn: 'ফলস সিলিং ডিজাইন', name_en: 'False Ceiling Design', slug: 'false-ceiling-design', is_active: true },
      { id: 'gypsum-ceiling', name_bn: 'জিপসাম সিলিং', name_en: 'Gypsum Ceiling', slug: 'gypsum-ceiling', is_active: true },
      { id: 'pvc-ceiling', name_bn: 'পিভিসি সিলিং', name_en: 'PVC Ceiling', slug: 'pvc-ceiling', is_active: true },
    ],
  },
  {
    id: 'daily-labour',
    name_bn: 'দৈনিক লেবার',
    name_en: 'Daily Labour Services',
    slug: 'daily-labour',
    icon: 'Users',
    display_order: 11,
    is_active: true,
    subcategories: [
      { id: 'construction-labour', name_bn: 'নির্মাণ কাজে সাধারণ লেবার', name_en: 'Construction General Labour', slug: 'construction-labour', is_active: true },
      { id: 'goods-load-unload', name_bn: 'মালামাল লোড-আনলোড', name_en: 'Loading & Unloading Goods', slug: 'goods-load-unload', is_active: true },
      { id: 'soil-cleaning-work', name_bn: 'মাটি কাটা ও পরিষ্কার পরিচ্ছন্নতা', name_en: 'Earth Cutting & Cleaning', slug: 'soil-cleaning-work', is_active: true },
    ],
  },
  {
    id: 'other-services',
    name_bn: 'অন্যান্য সেবা',
    name_en: 'Other Services',
    slug: 'other-services',
    icon: 'MoreHorizontal',
    display_order: 12,
    is_active: true,
    subcategories: [
      { id: 'home-appliance-repair', name_bn: 'হোম অ্যাপ্লায়েন্স মেরামত', name_en: 'Home Appliance Repair', slug: 'home-appliance-repair', is_active: true },
      { id: 'ac-service', name_bn: 'এসি সার্ভিস ও গ্যাস চার্জ', name_en: 'AC Service & Gas Charging', slug: 'ac-service', is_active: true },
      { id: 'cctv-installation', name_bn: 'সিসিটিভি ক্যামেরা ইনস্টলেশন', name_en: 'CCTV Camera Installation', slug: 'cctv-installation', is_active: true },
    ],
  },
]

declare global {
  // eslint-disable-next-line no-var
  var __CATEGORIES_STORE__: CategoryOption[] | undefined
}

export function getCategoriesStore(): CategoryOption[] {
  if (!global.__CATEGORIES_STORE__) {
    global.__CATEGORIES_STORE__ = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES))
  }
  return global.__CATEGORIES_STORE__!
}

export function getSubcategoriesForCategory(
  categorySlugOrId: string,
  customCategories?: CategoryOption[]
): SubcategoryOption[] {
  const list = customCategories && customCategories.length > 0 ? customCategories : getCategoriesStore()
  if (!categorySlugOrId) return []

  const target = categorySlugOrId.trim().toLowerCase()

  const found = list.find(
    (c) =>
      c.id.toLowerCase() === target ||
      c.slug.toLowerCase() === target ||
      c.name_en.toLowerCase() === target ||
      c.name_bn.trim() === categorySlugOrId.trim()
  )

  return found ? (found.subcategories || []) : []
}

