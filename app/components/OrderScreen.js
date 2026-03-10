"use client";

import { useStore } from "../context/StoreContext";
import ProductImage from "./ProductImage";
import QuantityControl from "./QuantityControl";

export default function OrderScreen() {
  const {
    products,
    quantities,
    memberCard,
    error,
    loading,
    handleQuantityChange,
    handleMemberCardChange,
    handleCalculate,
  } = useStore();
  return (
    <div className="min-h-screen bg-white flex flex-col px-5 py-8">
      <div className="max-w-sm mx-auto w-full flex flex-col flex-1 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-4"
          >
            <ProductImage color={product.color} name={product.name} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 leading-tight">{product.name}</p>
              <p className="text-gray-500 text-sm mt-0.5">${product.price.toFixed(2)}</p>
            </div>
            <QuantityControl
              value={quantities[product.id] || 0}
              onDecrease={() => handleQuantityChange(product.id, -1)}
              onIncrease={() => handleQuantityChange(product.id, 1)}
            />
          </div>
        ))}

        <div className="mt-2">
          <p className="text-gray-700 font-medium mb-2">Card Number</p>
          <input
            type="text"
            value={memberCard}
            onChange={(e) => handleMemberCardChange(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-full px-5 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="flex-1" />

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full py-4 bg-blue-400 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors text-base"
        >
          {loading ? "Calculating..." : "Calculate"}
        </button>
      </div>
    </div>
  );
}
