export interface CategoryType {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  productIds: number[];
}

export const categories: CategoryType[] = [
  {
    id: 1,
    name: "Zemra",
    slug: "zemra",
    tagline: "Mbështet shëndetin e zemrës",
    productIds: [1, 4, 12, 15],
  },
  {
    id: 2,
    name: "Imuniteti",
    slug: "imuniteti",
    tagline: "Forco mbrojtjen natyrale të trupit",
    productIds: [2, 6, 7, 13],
  },
  {
    id: 3,
    name: "Gjumi",
    slug: "gjumi",
    tagline: "Përmirëso cilësinë e gjumit",
    productIds: [3, 8, 14],
  },
  {
    id: 4,
    name: "Truri",
    slug: "truri",
    tagline: "Rrit fokusin dhe përqendrimin",
    productIds: [9, 10, 11],
  },
  {
    id: 5,
    name: "Femra",
    slug: "femra",
    tagline: "Mbështet mirëqenien e femrës",
    productIds: [2, 4, 8, 14],
  },
  {
    id: 6,
    name: "Meshkuj",
    slug: "meshkuj",
    tagline: "Rrit energjinë dhe vitalitetin",
    productIds: [1, 5, 10, 11],
  },
];

export const getCategoryBySlug = (slug: string) => {
  return categories.find((category) => category.slug === slug);
};
