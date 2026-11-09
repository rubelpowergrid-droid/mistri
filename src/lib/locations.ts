// Central Location & Geolocation Utilities

export interface UpazilaOption {
  id: string
  name_bn: string
  name_en: string
}

export interface DistrictOption {
  id: string
  name_bn: string
  name_en: string
  upazilas: UpazilaOption[]
}

export const DEFAULT_DISTRICTS: DistrictOption[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    name_bn: 'ঠাকুরগাঁও',
    name_en: 'Thakurgaon',
    upazilas: [
      { id: 'e1db003d-c4f1-4462-bba1-4f6822c102bd', name_bn: 'ঠাকুরগাঁও সদর', name_en: 'Thakurgaon Sadar' },
      { id: 'c616ffbf-8e66-4d7a-99ef-c67a7594146b', name_bn: 'পীরগঞ্জ', name_en: 'Pirganj' },
      { id: '5fc1cb75-7731-43bc-bf39-974ac80ba00f', name_bn: 'রাণীশংকৈল', name_en: 'Ranisankail' },
      { id: '74001eb4-1849-4229-90b1-19ef6c11d88a', name_bn: 'হরিপুর', name_en: 'Haripur' },
      { id: '10572976-bb45-4aa2-9fc9-d4990332232a', name_bn: 'বালিয়াডাঙ্গী', name_en: 'Baliadangi' },
    ],
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    name_bn: 'পঞ্চগড়',
    name_en: 'Panchagarh',
    upazilas: [
      { id: '52d7c29b-8ce4-421e-a053-675f15bb9aca', name_bn: 'পঞ্চগড় সদর', name_en: 'Panchagarh Sadar' },
      { id: '2d176322-11fe-4506-87e6-da5f8f134892', name_bn: 'বোদা', name_en: 'Boda' },
      { id: '1870be5e-e3b9-4425-bef5-2d89f9b67db4', name_bn: 'দেবীগঞ্জ', name_en: 'Debiganj' },
      { id: '150ccbb6-9aec-41aa-9f58-5151aaceee5b', name_bn: 'আটোয়ারী', name_en: 'Atwari' },
      { id: '89493bf6-e291-4295-96d0-c12d2cbb90c6', name_bn: 'তেঁতুলিয়া', name_en: 'Tetulia' },
    ],
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    name_bn: 'দিনাজপুর',
    name_en: 'Dinajpur',
    upazilas: [
      { id: '03e165c1-56fe-471c-a34a-98c68544e334', name_bn: 'দিনাজপুর সদর', name_en: 'Dinajpur Sadar' },
      { id: '8d15687b-41b8-4645-ac5f-ebed2f4d8fce', name_bn: 'বীরগঞ্জ', name_en: 'Birganj' },
      { id: '610dee40-6daf-4679-ab80-31b6f04a9716', name_bn: 'কাহারোল', name_en: 'Kaharole' },
      { id: '1cabc744-0c11-4bab-831d-d532edc46f05', name_bn: 'বোচাগঞ্জ', name_en: 'Bochaganj' },
      { id: '7e210402-e52e-4cb4-bd05-c141707a9f47', name_bn: 'বিরল', name_en: 'Birol' },
      { id: '206ed729-3e41-4b52-a6c2-81b9a788a844', name_bn: 'চিরিরবন্দর', name_en: 'Chirirbandar' },
      { id: '12c910d4-1d73-4696-952e-bd6b7e6511e6', name_bn: 'পার্বতীপুর', name_en: 'Parbatipur' },
      { id: 'e8596bd1-1ff8-4500-b797-7838440ad56e', name_bn: 'ফুলবাড়ী', name_en: 'Fulbari' },
      { id: '6b43a666-b210-4f39-9a51-49875da4cd2d', name_bn: 'নবাবগঞ্জ', name_en: 'Nawabganj' },
      { id: 'f06e3493-06a9-413d-b46d-8763fcab569d', name_bn: 'বিরামপুর', name_en: 'Birampur' },
      { id: '8358eb4d-7366-47c1-b83c-6ed51abc8242', name_bn: 'হাকিমপুর', name_en: 'Hakimpur' },
      { id: '217e0b3b-170a-418e-b82a-3ca3a35da962', name_bn: 'ঘোড়াঘাট', name_en: 'Ghoraghat' },
      { id: 'cebf4423-ade9-4f1d-812f-57ca0ee381f7', name_bn: 'খানসামা', name_en: 'Khansama' },
    ],
  },
]

export function getUpazilasForDistrict(districtNameOrId: string, customDistricts?: DistrictOption[]): UpazilaOption[] {
  const list = customDistricts && customDistricts.length > 0 ? customDistricts : DEFAULT_DISTRICTS
  if (!districtNameOrId) return list[0].upazilas

  const normalized = districtNameOrId.trim().toLowerCase()

  const found = list.find((d) =>
    d.id === districtNameOrId ||
    d.name_bn.toLowerCase() === normalized ||
    d.name_en.toLowerCase() === normalized ||
    normalized.includes(d.name_bn.toLowerCase()) ||
    normalized.includes(d.name_en.toLowerCase())
  )

  return found ? found.upazilas : list[0].upazilas
}
