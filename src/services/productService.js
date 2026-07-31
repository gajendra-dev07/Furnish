import { products } from "@/constants/productsData";

export const getProductById = (id) => {
  return products.find((p) => p.id === id);
};

export const getProductsByCategory = (category) => {
  return products.filter((p) => p.category === category);
};

export const getFeaturedProducts = () => {
  return products.filter((p) => p.isBestSeller);
};

export const getNewArrivals = () => {
  return products.filter((p) => p.isNewArrival);
};
