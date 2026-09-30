import { api } from "./client";

export type ProductAttributeValue = {
  id: number;
  value: string;
};

export type ProductAttribute = {
  id: number;
  name: string;
  type: string;
  values: ProductAttributeValue[];
};

export type Product = {
  id: number;
  name: string;
  attributes: ProductAttribute[];
};

export async function searchProducts(query: string) {
  const response = await api.get<Product[]>("/api/products/search", {
    params: { query },
  });

  return response.data;
}

export async function createProduct(productUrl: string) {
  const response = await api.post<Product>("/api/products", {
    productUrl,
  });

  return response.data;
}