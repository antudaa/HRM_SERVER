import * as XLSX from "xlsx";

export function buildHolidayTemplate(): Buffer {
    const rows = [
        ["name", "startDate", "endDate", "description"],
        ["New Year", "2025-01-01", "2025-01-01", "Public holiday"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "holidays");
    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

export function parseHolidaySheetToJson(buffer: Buffer) {
    const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
        raw: false,
        defval: "",
        dateNF: "yyyy-mm-dd",
    });

    const rows = json.map((r) => {
        const name = String(r.name ?? "").trim();
        const startDate = String(r.startDate ?? "").trim();
        const endDate = String(r.endDate ?? "").trim();
        const description = String(r.description ?? "").trim();

        return {
            name,
            startDate,
            endDate: endDate || undefined,
            description,
        };
    });

    return rows.filter(r => r.name || r.startDate || r.endDate || r.description);
}
