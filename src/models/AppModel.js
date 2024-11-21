import { PrismaClient } from "@prisma/client";

const AppModel = new PrismaClient().app;

export default AppModel;
