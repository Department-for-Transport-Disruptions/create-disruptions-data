import { promises as fs } from "fs";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import * as nptgUploader from "./index";

let nptgString = "";

describe("nptg-uploader", () => {
    const hoisted = vi.hoisted(() => ({
        dropTableMock: vi.fn().mockImplementation(() => ({
            ifExists: () => ({
                execute: vi.fn(),
            }),
        })),
        valuesMock: vi.fn().mockImplementation(() => ({
            execute: vi.fn().mockResolvedValue(null),
        })),
        insertMock: vi.fn().mockImplementation(() => ({
            values: hoisted.valuesMock,
        })),
    }));

    beforeAll(async () => {
        nptgString = await fs.readFile(`${__dirname}/test-data/nptg.xml`, "utf-8");
    });

    beforeEach(() => {
        vi.mock("@create-disruptions-data/shared-ts/utils/db", () => ({
            getDbClient: () => ({
                schema: {
                    dropTable: hoisted.dropTableMock,
                },
                sql: vi.fn(),
                getExecutor: () => ({
                    executeQuery: vi.fn(),
                    transformQuery: vi.fn(),
                    compileQuery: vi.fn(),
                }),
                executorProvider: {
                    getExecutor: vi.fn(),
                },
                insertInto: hoisted.insertMock,
            }),
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("uploads correct admin areas and localities to the database", async () => {
        await nptgUploader.parseNptgAndUpload(nptgString);

        expect(hoisted.insertMock).toBeCalledTimes(2);

        expect(hoisted.insertMock.mock.calls[0]).toStrictEqual(["nptgAdminAreasNew"]);
        expect(hoisted.valuesMock.mock.calls[0]).toMatchSnapshot();

        expect(hoisted.insertMock.mock.calls[1]).toStrictEqual(["localitiesNew"]);
        expect(hoisted.valuesMock.mock.calls[1]).toMatchSnapshot();
    });
});
