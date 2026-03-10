"use client";

import { useStore } from "../context/StoreContext";
import SummaryCard from "./SummaryCard";

export default function SummaryScreen() {
  const { result, handleRecalculate } = useStore();
  return (
    <div className="min-h-screen bg-white flex flex-col px-5 py-8">
      <div className="max-w-sm mx-auto w-full flex flex-col flex-1 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Calculate Total
        </h1>

        <SummaryCard>
          <p className="text-gray-700 text-sm mb-1">Total (before discount)</p>
          <p className="text-xl font-bold text-gray-900">
            ${result.subtotal.toFixed(2)}
          </p>
        </SummaryCard>

        {result.pairDiscounts.length > 0 && (
          <SummaryCard>
            <p className="text-gray-700 text-sm font-semibold mb-2">
              Discounted Items
            </p>
            <div className="space-y-1">
              {result.pairDiscounts.map((d) => (
                <div
                  key={d.id}
                  className="flex justify-between text-sm text-gray-600"
                >
                  <span>
                    {d.name} x{d.quantity}
                    <span className="text-gray-400 ml-1">
                      ({d.pairs} pair{d.pairs > 1 ? "s" : ""} x5%)
                    </span>
                  </span>
                  <span className="tabular-nums">
                    -${d.discount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </SummaryCard>
        )}

        <SummaryCard>
          <p className="text-gray-700 text-sm mb-1">
            Discount from Member Card
          </p>
          <p className="text-xl font-bold text-gray-900">
            {result.hasMemberCard
              ? `-$${result.memberDiscount.toFixed(2)}`
              : "$0.00"}
          </p>
        </SummaryCard>

        <SummaryCard>
          <p className="text-gray-700 text-sm mb-1">Final Total</p>
          <p className="text-xl font-bold text-gray-900">
            ${result.total.toFixed(2)}
          </p>
        </SummaryCard>

        <div className="flex justify-center mt-4">
          <button
            onClick={handleRecalculate}
            className="px-10 py-3 bg-blue-400 hover:bg-blue-500 text-white font-semibold rounded-full transition-colors"
          >
            Recalculate
          </button>
        </div>
      </div>
    </div>
  );
}
