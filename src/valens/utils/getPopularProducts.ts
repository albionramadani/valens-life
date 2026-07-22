const popularImg_1 = "/assets/img/products/omega-3.svg";
const popularImg_2 = "/assets/img/products/magnesium-test.svg";
const popularImg_3 = "/assets/img/products/ashwagandha.svg";
const popularImg_4 = "/assets/img/products/melatonin.svg";
type PopularProduct = {
  id: number;
  page: "shop";
  title: string;
  price: number;
  discount?: number;
  thumb: any;
  class_name: string;
  valensSubtitle: string;
};

const popularCopy = [
  {
    title: "Super Omega 3",
    desc: "Mbështet shëndetin e zemrës dhe qarkullimin",
    price: 85.99,
    discount: 10,
  },
  {
    title: "Magnesium Caps",
    desc: "Ndihmon në relaksimin e muskujve dhe gjumë më të mirë",
    price: 88.99,
  },
  {
    title: "Ashwagandha",
    desc: "Mbështet kockat dhe sistemin imunitar",
    price: 120.99,
    discount: 16,
  },
  {
    title: "Melatonin",
    desc: "Ndihmon në një gjumë më të qetë dhe të rregullt",
    price: 90.99,
  },
];

const popularImages = [popularImg_1, popularImg_2, popularImg_3, popularImg_4];

export const getPopularProducts = (limit = 8): PopularProduct[] => {
  const safeLimit = Math.max(0, limit);

  return Array.from({ length: safeLimit }, (_, index) => {
    const copy = popularCopy[index % popularCopy.length];
    const displayThumb = popularImages[index % popularImages.length];

    return {
      id: index + 1,
      page: "shop",
      title: copy.title,
      price: copy.price,
      discount: copy.discount,
      thumb: displayThumb,
      class_name: "",
      valensSubtitle: copy.desc,
    };
  });
};
