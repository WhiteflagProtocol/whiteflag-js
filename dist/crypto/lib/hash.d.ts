export { hkdf, hash, hmac };
declare function hkdf(ikm: Uint8Array<ArrayBuffer>, salt: Uint8Array<ArrayBuffer>, info: Uint8Array, keylen: number): Promise<Uint8Array>;
declare function hash(data: Uint8Array<ArrayBuffer>, len?: number, hashalg?: string): Promise<Uint8Array<ArrayBuffer>>;
declare function hmac(key: Uint8Array<ArrayBuffer>, msg: Uint8Array<ArrayBuffer>, hashalg?: string): Promise<Uint8Array<ArrayBuffer>>;
