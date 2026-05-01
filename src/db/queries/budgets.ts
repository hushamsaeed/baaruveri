import { eq } from "drizzle-orm";
import { db } from "../index";
import { budgetLines as budgetTable } from "../schema";
import type { BudgetLine } from "@/lib/types";

type Row = typeof budgetTable.$inferSelect;

function rowToBudgetLine(r: Row): BudgetLine {
  return {
    island_id: r.islandId,
    fiscal_year: r.fiscalYear,
    quarter: r.quarter as 1 | 2 | 3 | 4,
    line_item_dv: r.lineItemDv,
    line_item_en: r.lineItemEn,
    allocated_mvr: r.allocatedMvr,
    spent_mvr: r.spentMvr,
    yoy_pct: r.yoyPct,
  };
}

export async function getBudgetLines(islandId: string): Promise<BudgetLine[]> {
  const rows = await db
    .select()
    .from(budgetTable)
    .where(eq(budgetTable.islandId, islandId));
  return rows.map(rowToBudgetLine);
}

export async function listBudgetLines(): Promise<BudgetLine[]> {
  const rows = await db.select().from(budgetTable);
  return rows.map(rowToBudgetLine);
}
