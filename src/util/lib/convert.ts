/**
 * @module util/convert
 * @summary Whiteflag JS common data conversions
 */
export {
    isObject,
    isString,
    toBase64u,
    toBase64,
    b64uToHex,
    b64uToString,
    b64uToU8a,
    hexToB64u,
    hexToString,
    hexToU8a,
    stringToB64u,
    stringToHex,
    stringToU8a,
    u8aToB64u,
    u8aToHex,
    u8aToString,
};

/* Module constants */
const NOSEPARATOR = '';
const HEXBYTELENGTH = 2;
const HEXRADIX = 16;

/* MAIN MODULE FUNCTIONS */
/**
 * Checks if something is an object
 * @function isObject
 * @param obj something that might be an object
 * @returns true if object, else false
 */
function isObject(obj: any): boolean {
    return (typeof obj === 'object' || obj instanceof Object);
}

/**
 * Checks if something is a string
 * @function isString
 * @param charString something that might be a string
 * @returns true if string, else false
 */
function isString(charString: any): boolean {
    return (typeof charString === 'string' || charString instanceof String); 
}

/**
 * Convert base64 to base64url
 * @param base64 a base64 encoded string
 * @returns a base64url encoded string
 */
function toBase64u(base64: string): string {
    return base64
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

/**
 * Convert base64url to base64
 * @param b64uString a base64url encoded string
 * @returns a base64 encoded string
 */
function toBase64(b64uString: string): string {
    let base64: string = b64uString
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    switch (base64.length % 4) {
        case 2: base64 += "=="; break;
        case 3: base64 += "="; break;
    };
    return base64;
}

/**
 * Creates hexadecimal string from a base64url encoded string
 * @function b64uToHex
 * @param b64uString a base64url encoded string
 * @returns a hexadecimal encoded string
 */
function b64uToHex(b64uString: string): string {
    return stringToHex(b64uToString(b64uString));
}

/**
 * Creates a standard string from a base64url encoded string
 * @function b64uToString
 * @param b64uString a base64url encoded string
 * @returns a standard string
 */
function b64uToString(b64uString: string): string {
    return atob(toBase64(b64uString));
}

/**
 * Creates a UInt8 typed array from a base64url encoded string
 * @function b64uToU8a
 * @param b64uString a base64url encoded string
 * @returns a UInt8 typed array
 */
function b64uToU8a(b64uString: string): Uint8Array {
    return stringToU8a(b64uToString(b64uString));
}

/**
 * Creates a base64url encoded string from a hexadecimal string
 * @function hexToB64u
 * @param hexString a hexadecimal string
 * @returns a base64url encoded string
 */
function hexToB64u(hexString: string): string {
    return u8aToB64u(hexToU8a(hexString));
}

/**
 * Creates a regular string from a hexadecimal string
 * @function hexToString
 * @param hexString a hexadecimal string
 * @returns a regular string
 */
function hexToString(hexString: string): string {
    return u8aToString(hexToU8a(hexString));
}

/**
 * Creates a UInt8 typed array from a hexadecimal string
 * @function hexToU8a
 * @param hexString a hexadecimal string
 * @returns an array of 8-bit unsigned integers
 */
function hexToU8a(hexString: string): Uint8Array {
    const u8array = new Uint8Array(hexString.length / HEXBYTELENGTH);
    for (let i = 0; i < hexString.length; i += HEXBYTELENGTH) {
        u8array[i / HEXBYTELENGTH] = parseInt(hexString.slice(i, i + HEXBYTELENGTH), HEXRADIX);
    }
    return u8array;
}

/**
 * Creates a base64url encoded string from a regular string
 * @function stringToB64u
 * @param charString a regular character string
 * @returns a base64url encoded string
 */
function stringToB64u(charString: string): string {
    return toBase64u(btoa(charString));
}

/**
 * Creates a hexadecimal string from a regular string
 * @function stringToHex
 * @param charString a regular character string
 * @returns a hexadecimal string
 */
function stringToHex(charString: string): string {
    let hexString: string = '';
    for (let i = 0; i < charString.length; i++) {
        hexString += charString
            .charCodeAt(i).toString(HEXRADIX)
            .padStart(HEXBYTELENGTH, '0');
    }
    return hexString;
}

/**
 * Creates a UInt8 typed array from a regular string
 * @function stringToU8a
 * @param charString a regular character string
 * @returns an array of 8-bit unsigned integers
 */
function stringToU8a(charString: string): Uint8Array {
    return Uint8Array.from(charString, char => char.charCodeAt(0));
}

/**
 * Creates a base64url encoded string from a UInt8 typed array
 * @function u8aToB64u
 *  @param u8array an array of 8-bit unsigned integers
 * @returns a base64url encoded string
 */
function u8aToB64u(u8array: Uint8Array): string {
    return stringToB64u(u8aToString(u8array));
}

/**
 * Creates a hexadecimal string from an Uint8Array
 * @function u8aToHex
 * @param u8array an array of 8-bit unsigned integers
 * @returns a hexadecimal string
 */
function u8aToHex(u8array: Uint8Array): string {
    let hexArray = [];
    for (const byte of u8array) {
        hexArray.push(byte
            .toString(HEXRADIX)
            .padStart(HEXBYTELENGTH, '0')
        );
    }
    return hexArray.join(NOSEPARATOR);
}

/**
 * Creates a standard string from a UInt8 typed array
 * @function u8aToString
 * @param u8array a UInt8 typed array
 * @returns a standard string
 */
function u8aToString(u8array: Uint8Array): string {
    return String.fromCharCode(...u8array);
}
