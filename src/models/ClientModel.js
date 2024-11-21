import { PrismaClient } from "@prisma/client";

const ClientModel = new PrismaClient().client;

export default ClientModel;
