// Simple frontend-only OTP utility using localStorage for demo purposes
// NOTE: This is NOT secure and should be replaced with a real SMS provider + backend verification in production.

const DEFAULT_OTP_LENGTH = 6;
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

function getStorageKey(phone) {
  return `otp_${phone}`;
}

function generateCode(length = DEFAULT_OTP_LENGTH) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export function generateAndSendOtp(phone, options = {}) {
  const { ttlMs = DEFAULT_TTL_MS, resendCooldownMs = DEFAULT_RESEND_COOLDOWN_MS, length = DEFAULT_OTP_LENGTH } = options;
  const key = getStorageKey(phone);
  const now = Date.now();
  const existingRaw = localStorage.getItem(key);
  if (existingRaw) {
    try {
      const existing = JSON.parse(existingRaw);
      if (existing.lastSentAt && now - existing.lastSentAt < resendCooldownMs) {
        const remainingMs = resendCooldownMs - (now - existing.lastSentAt);
        const error = new Error('Resend cooldown active');
        error.code = 'COOLDOWN';
        error.remainingMs = remainingMs;
        throw error;
      }
    } catch (_) {
      // ignore parse error
    }
  }

  const code = generateCode(length);
  const payload = {
    code,
    expiresAt: now + ttlMs,
    lastSentAt: now,
  };
  localStorage.setItem(key, JSON.stringify(payload));

  // Simulate SMS send by logging to console. In production, call backend to send via provider (Twilio, etc.)
  // eslint-disable-next-line no-console
  console.log(`[OTP DEBUG] SMS code to ${phone}: ${code}`);
  return { code, expiresAt: payload.expiresAt };
}

export function verifyOtp(phone, code) {
  const key = getStorageKey(phone);
  const raw = localStorage.getItem(key);
  if (!raw) return { ok: false, reason: 'NO_CODE' };
  try {
    const data = JSON.parse(raw);
    const now = Date.now();
    if (now > data.expiresAt) return { ok: false, reason: 'EXPIRED' };
    if (String(code).trim() !== String(data.code).trim()) return { ok: false, reason: 'MISMATCH' };
    return { ok: true };
  } catch {
    return { ok: false, reason: 'INVALID_STORE' };
  }
}

export function clearOtp(phone) {
  const key = getStorageKey(phone);
  localStorage.removeItem(key);
}

export function getResendRemainingMs(phone, resendCooldownMs = DEFAULT_RESEND_COOLDOWN_MS) {
  const key = getStorageKey(phone);
  const raw = localStorage.getItem(key);
  if (!raw) return 0;
  try {
    const data = JSON.parse(raw);
    const now = Date.now();
    if (!data.lastSentAt) return 0;
    const elapsed = now - data.lastSentAt;
    return Math.max(0, resendCooldownMs - elapsed);
  } catch {
    return 0;
  }
}

export function formatSeconds(ms) {
  return Math.ceil(ms / 1000);
}


