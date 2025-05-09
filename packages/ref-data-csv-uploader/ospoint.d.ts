declare module "ospoint" {
    export default class OsPoint {
        constructor(northings: string, eastings: string);

        toWGS84(): { longitude: number; latitude: number } | null;
    }
}
