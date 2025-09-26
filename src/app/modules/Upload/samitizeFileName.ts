export const sanitizeFileName = (name: string) =>
    name.replace(/[^a-z0-9\s-]/gi, "").trim();
