export class LargePolygonError extends Error {
    constructor() {
        super();
        Object.setPrototypeOf(this, LargePolygonError.prototype);
    }
}
