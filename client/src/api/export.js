import { api } from "./client";

export const exportApi = {
  download: async (groupId, params = {}, fallbackName = "group") => {
    const response = await api.get(`/groups/${groupId}/export`, {
      params,
      responseType: "blob",
    });

    const isPdf = params.format === "pdf";
    const contentType = isPdf ? "application/pdf" : "text/csv;charset=utf-8";
    const blob = new Blob([response.data], { type: contentType });

    let filename = `${fallbackName.replace(/\s+/g, "_")}_expenses_${new Date().toISOString().slice(0, 10)}.${isPdf ? "pdf" : "csv"}`;
    const disposition = response.headers["content-disposition"];
    if (disposition) {
      const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1]);
      }
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
