export { BinaryArray };
declare class BinaryArray {
    private buffer;
    private constructor();
    static fromHex(hexString: string): BinaryArray;
    toHex(): string;
}
