import React from "react";
import * as L from "lucide-react";
import { P } from "./theme";

/** Lucide (ISC) icons restyled to the receipt world: ink, 3px strokes, round caps. */
export type IconName = "key" | "home" | "dollar" | "trending-up" | "trending-down" | "users" | "map-pin" | "receipt" | "store" | "shopping-cart" | "fuel" | "coffee" | "smartphone" | "building" | "tag" | "percent" | "calendar" | "landmark" | "scale" | "x" | "check" | "alert" | "question" | "brain" | "route";
const MAP: Record<IconName, React.ComponentType<L.LucideProps>> = {
  key: L.KeyRound, home: L.House, dollar: L.CircleDollarSign, "trending-up": L.TrendingUp, "trending-down": L.TrendingDown, users: L.Users, "map-pin": L.MapPin, receipt: L.Receipt,
  store: L.Store, "shopping-cart": L.ShoppingCart, fuel: L.Fuel, coffee: L.Coffee, smartphone: L.Smartphone, building: L.Building2, tag: L.Tag, percent: L.Percent, calendar: L.CalendarDays,
  landmark: L.Landmark, scale: L.Scale, x: L.X, check: L.Check, alert: L.TriangleAlert, question: L.CircleQuestionMark, brain: L.Brain, route: L.Route,
};
export const Icon: React.FC<{ name: IconName; size?: number; color?: string; fill?: string }> = ({ name, size = 120, color = P.ink, fill }) => {
  const C = MAP[name];
  return <C size={size} color={color} strokeWidth={2.6} {...(fill ? { fill } : {})} />;
};
