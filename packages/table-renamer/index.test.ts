import { getDbClient } from "@create-disruptions-data/shared-ts/utils/db";
import { describe, expect, it, vi } from "vitest";
import { TableKey, checkTables, deleteAndRenameTables } from "./index";

const mockExecute = vi.fn().mockResolvedValue([{ count: 100 }]);
const mockSchema = {
    dropTable: vi.fn().mockReturnThis(),
    ifExists: vi.fn().mockReturnThis(),
    cascade: vi.fn().mockReturnThis(),
    alterTable: vi.fn().mockReturnThis(),
    renameTo: vi.fn().mockReturnThis(),
    execute: mockExecute,
};

describe("table renamer", () => {
    process.env.IS_LOCAL = "true";

    vi.mock("@create-disruptions-data/shared-ts/utils/db", async (importOriginal) => ({
        ...(await importOriginal<typeof import("@create-disruptions-data/shared-ts/utils/db")>()),
        getDbClient: vi.fn(() => ({
            selectFrom: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            execute: mockExecute,
            schema: mockSchema,
            destroy: vi.fn(),
            fn: {
                count: vi.fn().mockReturnThis(),
                as: vi.fn(),
            },
        })),
    }));

    const tables: TableKey[] = [{ table: "operators", newTable: "operatorsNew", needsCheck: true }];

    describe("getMatchingTables", () => {
        it("should not throw an error if there is data in the new table", async () => {
            const dbClient = await getDbClient();

            await expect(checkTables(tables, dbClient)).resolves.not.toThrowError();
        });

        it("should throw an error if new table is empty", async () => {
            const dbClient = await getDbClient();
            mockExecute.mockResolvedValueOnce([{ count: 0 }]);

            await expect(checkTables(tables, dbClient)).rejects.toThrowError("No data found in table operatorsNew");
        });
    });

    describe("renameTables", () => {
        it("should drop the old table", async () => {
            const dbClient = await getDbClient();
            await deleteAndRenameTables(tables, dbClient);

            expect(mockSchema.dropTable).toHaveBeenCalledWith("operatorsOld");
        });

        it("should rename the current table", async () => {
            const dbClient = await getDbClient();
            await deleteAndRenameTables(tables, dbClient);

            expect(mockSchema.alterTable).toHaveBeenCalledWith("operators");
            expect(mockSchema.renameTo).toHaveBeenCalledWith("operatorsOld");
        });

        it("should rename the new table", async () => {
            const dbClient = await getDbClient();
            await deleteAndRenameTables(tables, dbClient);

            expect(mockSchema.alterTable).toHaveBeenCalledWith("operatorsNew");
            expect(mockSchema.renameTo).toHaveBeenCalledWith("operators");
        });
    });
});
