import ZKLib from "node-zklib";

type FingerprintRow = {
  userSn: number;
  deviceUserId: string;
  recordTime: string;
  ip?: string;
};

// Nice error-string helper
const errMsg = (e: any) => {
  if (e?.message && typeof e.message === "string") return e.message;
  try { return JSON.stringify(e); } catch { return String(e); }
};

export const fetchFingerprintAttendances = async (): Promise<FingerprintRow[]> => {
  const deviceIP = process.env.FINGERPRINT_MACHINE_IP;
  const devicePort = Number(process.env.FINGERPRINT_DEVICE_PORT || 4370);
  const inPort    = Number(process.env.FINGERPRINT_INPORT || 5200);
  const timeoutMs = Number(process.env.FINGERPRINT_TIMEOUT_MS || 5000);

  if (!deviceIP || Number.isNaN(devicePort)) {
    throw new Error("FINGERPRINT_MACHINE_IP / FINGERPRINT_DEVICE_PORT not configured");
  }

  // Create a fresh instance per call (avoids stale sockets/crashes)
  const zk = new (ZKLib as any)(deviceIP, devicePort, timeoutMs, inPort);

  try {
    // 1) connect TCP → device
    try {
      await zk.createSocket();
    } catch (e: any) {
      throw new Error(
        `TCP CONNECT failed to ${deviceIP}:${devicePort}. ` +
        `Check device is online, port 4370 open, and network/VLAN routing. ${errMsg(e)}`
      );
    }

    // 2) read logs
    let payload: any;
    try {
      payload = await zk.getAttendances();
    } catch (e: any) {
      throw new Error(`Failed to read attendances from device ${deviceIP}:${devicePort}. ${errMsg(e)}`);
    }

    const rows = Array.isArray(payload?.data) ? payload.data : [];
    // 3) normalize → use **UTC ISO** so downstream Date(...) is stable
    const normalized: FingerprintRow[] = rows.map((r: any) => {
      // node-zklib variants: r.recordTime or r.timestamp; r.userSn / r.uid; r.deviceUserId / r.userId
      const ts = r.recordTime ?? r.timestamp ?? Date.now();
      const iso = new Date(ts).toISOString();
      return {
        userSn: Number(r.userSn ?? r.uid ?? 0),
        deviceUserId: String(r.deviceUserId ?? r.userId ?? r.uid ?? ""),
        recordTime: iso,   // keep ISO here; your transformer converts to BDT later
        ip: deviceIP,
      };
    });

    return normalized;
  } finally {
    // 4) always close socket
    try { await zk.disconnect(); } catch {}
  }
};
