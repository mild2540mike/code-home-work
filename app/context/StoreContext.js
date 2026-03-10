"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchProducts, fetchCalculate } from "../lib/api";
import { buildOrderItems } from "../lib/calculator";
const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  // Product catalogue
  const [products, setProducts] = useState([]);

  // Order state
  const [quantities, setQuantities] = useState({});
  const [memberCard, setMemberCard] = useState("");

  // UI state
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      setQuantities(Object.fromEntries(data.map((p) => [p.id, 0])));
    });
  }, []);

  const handleQuantityChange = useCallback((id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  }, []);

  const handleMemberCardChange = useCallback((val) => {
    setMemberCard(val);
    setError(null);
  }, []);

  const handleCalculate = useCallback(async () => {
    const items = buildOrderItems(quantities);

    if (items.length === 0) {
      setError("Please select at least one item.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const data = await fetchCalculate({ items, memberCardNumber: memberCard });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [quantities, memberCard]);

  const handleRecalculate = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const value = {
    products,
    quantities,
    memberCard,
    result,
    error,
    loading,
    handleQuantityChange,
    handleMemberCardChange,
    handleCalculate,
    handleRecalculate,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
