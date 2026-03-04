import { postJson } from "@/lib/accounts/http-client";

import type { CategoryOption } from "./types";

type BackendCategory = {
  _id: string;
  name: string;
  color?: string;
  icon?: string;
};

const FALLBACK_CATEGORIES: CategoryOption[] = [
  { id: "fallback-food", name: "Food" },
  { id: "fallback-transport", name: "Transport" },
  { id: "fallback-bills", name: "Bills" },
  { id: "fallback-income", name: "Income" },
  { id: "fallback-savings", name: "Savings" },
];

export async function listCategories(): Promise<CategoryOption[]> {
  try {
    const rows = await postJson<BackendCategory[]>("/categories/list", {});
    if (rows.length === 0) {
      return FALLBACK_CATEGORIES;
    }

    return rows.map((row) => ({
      id: row._id,
      name: row.name,
      color: row.color,
      icon: row.icon,
    }));
  } catch {
    return FALLBACK_CATEGORIES;
  }
}
