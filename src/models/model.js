import { PrismaClient } from "@prisma/client";

export const InvoiceModel = new PrismaClient().invoice;
export const InvoiceItemsModel = new PrismaClient().invoice_items;
export const ClientModel = new PrismaClient().client;
export const AppModel = new PrismaClient().app;
