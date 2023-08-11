export class LargePolygonError extends Error {
    constructor() {
        super();
        Object.setPrototypeOf(this, LargePolygonError.prototype);
    }
}

export class NoStopsError extends Error {
    constructor() {
        super();
        Object.setPrototypeOf(this, NoStopsError.prototype);
    }
}
