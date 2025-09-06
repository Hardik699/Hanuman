export type EncryptedPayload = {
  v: number; // version
  s: string; // base64 salt
  i: string; // base64 iv
  d: string; // base64 ciphertext
};

const te = new TextEncoder();
const td = new TextDecoder();

function ab2b64(ab: ArrayBuffer): string {
  const bytes = new Uint8Array(ab);
  let binary = "";
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function b642ab(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function deriveKey(
  password: string,
  salt: ArrayBuffer,
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    te.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 150000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptText(
  text: string,
  password: string,
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16)).buffer;
  const iv = crypto.getRandomValues(new Uint8Array(12)).buffer;
  const key = await deriveKey(password, salt);
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    te.encode(text),
  );
  const payload: EncryptedPayload = {
    v: 1,
    s: ab2b64(salt),
    i: ab2b64(iv),
    d: ab2b64(cipher),
  };
  return JSON.stringify(payload);
}

export async function decryptText(
  payloadStr: string,
  password: string,
): Promise<string> {
  const payload: EncryptedPayload = JSON.parse(payloadStr);
  if (!payload || payload.v !== 1) throw new Error("Unsupported payload");
  const salt = b642ab(payload.s);
  const iv = b642ab(payload.i);
  const data = b642ab(payload.d);
  const key = await deriveKey(password, salt);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return td.decode(plain);
}

export async function encryptJSON(
  obj: unknown,
  password: string,
): Promise<string> {
  return encryptText(JSON.stringify(obj), password);
}

export async function decryptToJSON<T = unknown>(
  payloadStr: string,
  password: string,
): Promise<T> {
  const txt = await decryptText(payloadStr, password);
  return JSON.parse(txt) as T;
}
