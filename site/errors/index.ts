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

export class TooManyConsequencesError extends Error {
    constructor() {
        super();
        Object.setPrototypeOf(this, TooManyConsequencesError.prototype);
    }
}

export class NoStateOrCodeError extends Error {
    constructor() {
        super();
        Object.setPrototypeOf(this, NoStateOrCodeError.prototype);
    }
}

export class NotAnAgencyAccountError extends Error {
    constructor() {
        super();
        Object.setPrototypeOf(this, NotAnAgencyAccountError.prototype);
    }
}
