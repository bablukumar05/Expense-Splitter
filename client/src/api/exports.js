import { filenameFromDisposition } from "@/lib/download";
import { api } from "./client";

export async function downloadGroupExport(groupId, { format, from, to, category }) {
  const response = await api.get(`/groups/${groupId}/export`, {
    params: { format, from, to, fromDate: from, toDate: to, ...(category ? { category } : {}) },
    responseType: "blob",
    timeout: 120_000,
  });
  return {
    blob: response.data,
    filename: filenameFromDisposition(response.headers?.["content-disposition"]),
  };
}
