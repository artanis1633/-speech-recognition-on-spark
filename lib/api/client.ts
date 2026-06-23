/**
 * HTTP API client aligned with spark-trams-agent backend.
 * See: docs/api.md
 */

import type { GlossaryEntry, GlossaryImportResult, GlossaryState, MeetingMinutes, PromptItem } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// --- Health ---

export async function getHealth(): Promise<{ status: string }> {
  return request("/health");
}

// --- Export ---

/** Triggers a Markdown transcript download for the given session */
export function getExportUrl(sessionId: string): string {
  return `${API_BASE_URL}/api/export/${sessionId}`;
}

export async function downloadExport(sessionId: string): Promise<void> {
  const url = getExportUrl(sessionId);
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// --- Prompts ---

export async function getPrompts(): Promise<{ items: PromptItem[] }> {
  return request("/api/prompts");
}

export async function getPrompt(key: string): Promise<PromptItem> {
  return request(`/api/prompts/${key}`);
}

export async function updatePrompt(key: string, content: string): Promise<PromptItem> {
  return request(`/api/prompts/${key}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
}

export async function resetPrompt(key: string): Promise<PromptItem> {
  return request(`/api/prompts/${key}`, { method: "DELETE" });
}

export async function resetAllPrompts(): Promise<{ items: PromptItem[] }> {
  return request("/api/prompts/reset-all", { method: "POST" });
}

// --- Glossary State ---

export async function getGlossaryState(): Promise<GlossaryState> {
  return request("/api/glossary/state");
}

export async function setGlossaryState(enabled: boolean): Promise<GlossaryState> {
  return request("/api/glossary/state", {
    method: "PUT",
    body: JSON.stringify({ enabled }),
  });
}

// --- Glossary Categories ---

export async function getGlossaryCategories(): Promise<{ categories: string[] }> {
  return request("/api/glossary/categories");
}

// --- Glossary Entries ---

export interface GlossaryListParams {
  search?: string;
  category?: string;
  enabled?: boolean;
  page?: number;
  size?: number;
}

export interface GlossaryListResponse {
  items: GlossaryEntry[];
  total: number;
  page: number;
  size: number;
}

export async function getGlossaryEntries(params: GlossaryListParams = {}): Promise<GlossaryListResponse> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.category) searchParams.set("category", params.category);
  if (params.enabled !== undefined) searchParams.set("enabled", String(params.enabled));
  if (params.page) searchParams.set("page", String(params.page));
  if (params.size) searchParams.set("size", String(params.size));
  const qs = searchParams.toString();
  return request(`/api/glossary/entries${qs ? `?${qs}` : ""}`);
}

export async function createGlossaryEntry(data: {
  zh: string;
  en: string;
  abbr?: string;
  category?: string;
  enabled?: boolean;
}): Promise<GlossaryEntry> {
  return request("/api/glossary/entries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateGlossaryEntry(
  entryId: string,
  data: Partial<{ zh: string; en: string; abbr: string; category: string; enabled: boolean }>
): Promise<GlossaryEntry> {
  return request(`/api/glossary/entries/${entryId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteGlossaryEntry(entryId: string): Promise<{ deleted: boolean }> {
  return request(`/api/glossary/entries/${entryId}`, { method: "DELETE" });
}

export async function batchDeleteGlossaryEntries(ids: string[]): Promise<{ deleted: number }> {
  return request("/api/glossary/entries/batch-delete", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

// --- Meeting Minutes ---

/**
 * Fetch cached meeting minutes for a completed session.
 * Throws if the session is not found or minutes are not yet generated (404).
 */
export async function getMinutes(sessionId: string): Promise<MeetingMinutes> {
  return request(`/api/minutes/${sessionId}`);
}

/**
 * Force-generate (or regenerate) meeting minutes for a session.
 * Useful when auto-generation failed or when the prompt has been updated.
 */
export async function generateMinutes(sessionId: string): Promise<MeetingMinutes> {
  return request(`/api/minutes/${sessionId}/generate`, { method: "POST" });
}

// --- Glossary Import ---

export async function importGlossary(file: File): Promise<GlossaryImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/glossary/import`, {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type header; browser sets multipart boundary automatically
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `Import failed: ${response.status}`);
  }

  return response.json() as Promise<GlossaryImportResult>;
}
