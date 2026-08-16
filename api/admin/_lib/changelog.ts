import { kv, isKvConfigured } from "./kv";
import { ChangelogEntry } from "../../../src/app/types/cms";
import { nanoid } from "nanoid";

export async function addChangelogEntry(
  action: string,
  section: ChangelogEntry["section"]
): Promise<void> {
  if (!isKvConfigured()) return;

  try {
    const raw = await kv.get("miluarte:changelog");
    let entries: ChangelogEntry[] = [];
    if (typeof raw === "string") {
      entries = JSON.parse(raw || "[]");
    } else if (Array.isArray(raw)) {
      entries = raw as any;
    }

    const newEntry: ChangelogEntry = {
      id: nanoid(),
      timestamp: new Date().toISOString(),
      action,
      section,
    };

    entries.unshift(newEntry);
    // Mantener las últimas 50 entradas
    if (entries.length > 50) {
      entries = entries.slice(0, 50);
    }

    await kv.set("miluarte:changelog", JSON.stringify(entries));
  } catch (error) {
    console.error("Error al registrar en changelog:", error);
  }
}
