export default function QuantityControl({ value, onDecrease, onIncrease }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDecrease}
        disabled={value === 0}
        className="w-9 h-9 rounded-full bg-blue-400 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xl font-bold flex items-center justify-center transition-colors"
      >
        -
      </button>
      <span className="w-6 text-center font-semibold text-gray-800 tabular-nums text-base">
        {value}
      </span>
      <button
        onClick={onIncrease}
        className="w-9 h-9 rounded-full bg-blue-400 hover:bg-blue-500 text-white text-xl font-bold flex items-center justify-center transition-colors"
      >
        +
      </button>
    </div>
  );
}
