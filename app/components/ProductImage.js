export default function ProductImage({ color, name }) {
  return (
    <div
      className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-white text-xl font-bold select-none"
      style={{ backgroundColor: color }}
    >
      {name.charAt(0)}
    </div>
  );
}
