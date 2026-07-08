import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import type { PrismaClient as PrismaClientType } from "../generated/prisma/client.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
    path: path.resolve(currentDir, "../../.env"),
});

const { PrismaClient } = await import("../generated/prisma/client.js");

declare global {
    namespace globalThis {
        var prismadb : PrismaClientType;

    }
};

const prisma = new PrismaClient();

if(process.env.NODE_ENV === "production") globalThis.prismadb = prisma;

export default prisma;