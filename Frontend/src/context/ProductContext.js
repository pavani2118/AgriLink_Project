import React, { createContext, useEffect, useState } from "react";
import { getAllProducts } from "../services/products";

export const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);

  const refreshProducts = async () => {
    const res = await getAllProducts();
    setProducts(res.products || []);
  };

  useEffect(() => {
    refreshProducts().catch(() => {});
  }, []);

  return (
    <ProductContext.Provider value={{ products, setProducts, refreshProducts }}>
      {children}
    </ProductContext.Provider>
  );
}
