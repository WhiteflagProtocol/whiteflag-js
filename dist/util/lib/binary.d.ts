export { BinaryArray };
declare class BinaryArray {
    private buffer;
    length: number;
    private constructor();
    static fromUInt8Array(u8array: Uint8Array, bitLength?: number): BinaryArray;
    static fromHex(hexString: string): BinaryArray;
    toUInt8Array(): Uint8Array;
    toHex(): string;
}
