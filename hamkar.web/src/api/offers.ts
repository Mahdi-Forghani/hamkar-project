import { api } from "./client";
import type { Product } from "./products";

export type ProductAttributeSelection = {
  attributeId: number;
  valueId: number;
};

export type OfferAttributeSelection = {
  attributeId: number;
  attributeName: string;
  valueId: number;
  value: string;
};

export type CreateOfferRequest = {
  productId: number;
  price: number;
  productAttributes: ProductAttributeSelection[];
  attributes: CreateOfferAttributeSelection[];
};

export type CreateOfferAttributeSelection = {
  attributeId: number;
  valueId: number;
};

export type MyOffer = {
  id: number;
  product: Product;
  price: number;
  expiresAt: string;
  productAttributes: OfferAttributeSelection[];
  attributes: OfferAttributeSelection[];
};

export type ShopOfferAttribute = {
  name: string;
  value: string;
};

export type shopOffer = {
  shopName: string;
  ownerName: string;
  address: string;
  phoneNumber: string;
  price: number;
  attributes: ShopOfferAttribute[];
};

export type OfferSearchResult = {
  product: Product;
  offers: shopOffer[];
};

export type OfferAttributeValue = {
  id: number;
  value: string;
};

export type OfferAttribute = {
  id: number;
  name: string;
  type: string;
  values: OfferAttributeValue[];
};

export async function searchOffers(query: string) {
  const response = await api.get<OfferSearchResult[]>(
    "/api/offers/search",
    { params: { query } }
  );

  return response.data;
}

export async function getMyOffers() {
  const response = await api.get<MyOffer[]>("/api/offers/mine");

  return response.data;
}

export async function createOffer(request: CreateOfferRequest) {
  await api.post("/api/offers", request);
}

export async function updateOffer(offerId: number, price: number) {
  await api.put(`/api/offers/${offerId}`, { price });
}

export async function getOfferAttributes() {
  const response = await api.get<OfferAttribute[]>(
    "/api/offers/attributes"
  );

  return response.data;
}

export async function deleteOffer(offerId: number) {
  await api.delete(`/api/offers/${offerId}`);
}