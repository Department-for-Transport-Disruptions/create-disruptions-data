export class ClientError extends Error {
    constructor(msg: string) {
        super(msg);

        Object.setPrototypeOf(this, ClientError.prototype);
    }
}
