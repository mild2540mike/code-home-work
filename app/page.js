"use client";

import { useStore } from "./context/StoreContext";
import OrderScreen from "./components/OrderScreen";
import SummaryScreen from "./components/SummaryScreen";

export default function Home() {
  const { result } = useStore();
  return result ? <SummaryScreen /> : <OrderScreen />;
}
