import z from "zod";

export const columnTypeEnum = z.enum(["boolean", "int", "double", "string"]);

export const columnSchema = z.object({
    name: z.string(),
    type: columnTypeEnum,
});

export const createSheetSchema = z.object({
    columns: z.array(columnSchema).nonempty(),
});

export const lookupSchema = z.object({
    columnName: z.string(),
    cellIndex: z.number(),
});

export const setCellInSheetBodySchema = z
    .object({
        cellIndex: z.number(),
        value: z.unknown().optional(),
        lookup: lookupSchema.optional(),
    })
    .refine(
        (data) => {
            const hasValue = data.value !== undefined;
            const hasLookup = data.lookup !== undefined;
            return hasValue !== hasLookup;
        },
        {
            message:
                "Either 'value' or 'lookup' must be provided, but not both",
        }
    );
