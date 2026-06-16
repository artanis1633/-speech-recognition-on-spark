import type { ExportTask, MeetingSession, MeetingSummary, TermEntry } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  createMeeting(payload: Partial<MeetingSession>) {
    return request<MeetingSession>("/api/meetings", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  endMeeting(meetingId: string) {
    return request<MeetingSession>(`/api/meetings/${meetingId}/end`, {
      method: "POST"
    });
  },
  getMeetingSummary(meetingId: string) {
    return request<MeetingSummary>(`/api/meetings/${meetingId}/summary`);
  },
  getTerms(params = "") {
    return request<{ items: TermEntry[]; total: number }>(`/api/terms${params}`);
  },
  createExport(meetingId: string, format: ExportTask["format"]) {
    return request<ExportTask>(`/api/meetings/${meetingId}/exports`, {
      method: "POST",
      body: JSON.stringify({ format })
    });
  }
};
