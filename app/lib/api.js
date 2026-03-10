export async function fetchProducts() {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to fetch products.");
  return res.json();
}

export async function fetchCalculate({ items, memberCardNumber }) {
  const res = await fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, memberCardNumber }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Calculation failed.");
  return data;
}
