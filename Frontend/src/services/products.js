 
import { apiGet, apiPost, apiDelete } from "./api";

export const getAllProducts = async () => {
  console.log("Calling getAllProducts...");
  const result = await apiGet("/api/products");
  console.log("getAllProducts result:", result);
  return result;
};

export const getMyProducts = async () => {
  console.log("Calling getMyProducts...");
  const result = await apiGet("/api/products/mine");
  console.log("getMyProducts result:", result);
  return result;
};

export const createProduct = async (payload) => {
  console.log("Creating product with payload:", payload);
  const result = await apiPost("/api/products", payload);
  console.log("createProduct result:", result);
  return result;
};

export const deleteProduct = async (id) => {
  console.log("Deleting product:", id);
  const result = await apiDelete(`/api/products/${id}`);
  console.log("deleteProduct result:", result);
  return result;
};