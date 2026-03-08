import { apiAny } from "@/lib/backend-api";
import { convex } from "@/lib/convex-client";

import type { CategoryOption } from "./types";

type BackendCategory = {
  _id: string;
  name: string;
  color?: string;
  icon?: string;
};

export async function listCategories(): Promise<CategoryOption[]> {
  try {
    const rows = await convex.query(apiAny["categories/queries"].listCategories, {});
    return rows.map((row) => ({
      id: row._id,
      name: row.name,
      color: row.color,
      icon: row.icon,
    }));
  } catch {
    return [];
  }
}
