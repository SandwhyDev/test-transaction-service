import { PrismaClient } from "@prisma/client";

const InvoiceModel = new PrismaClient().invoice;

export default InvoiceModel;
