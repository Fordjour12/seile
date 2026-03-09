import { api } from "@/lib/backend-api";
import { useQuery } from "convex/react";

import type { CategoryOption } from "./types";

type BackendCategory = {
  _id: string;
  name: string;
  color?: string;
  icon?: string;
};

function mapCategory(row: BackendCategory): CategoryOption {
  return {
    id: row._id,
    name: row.name,
    color: row.color,
    icon: row.icon,
  };
}

export function useCategories(): CategoryOption[] | undefined {
  const rows = useQuery(api.categories.queries.listCategories, {});
  return rows?.map(mapCategory);
}
