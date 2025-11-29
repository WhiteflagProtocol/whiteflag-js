export { Jws };
declare class Jws {
    private protected;
    private payload;
    private signature;
    private constructor();
    static fromPayload(payload: Object): Jws;
    static fromObject(jws: any): Jws;
    static fromCompact(jws: string): Jws;
    isSigned(): boolean;
    getSignInput(): string;
    setSignAlgorithm(algorithm: string): boolean;
    setSignature(signature: string): boolean;
    getSignature(): string;
    toFull(): Object;
    toFlat(): Object;
    toCompact(): string;
}
