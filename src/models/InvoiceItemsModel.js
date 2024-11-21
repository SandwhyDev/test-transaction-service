import { PrismaClient } from "@prisma/client";

const InvoiceItemsModel = new PrismaClient().invoice_items;

export default InvoiceItemsModel;
