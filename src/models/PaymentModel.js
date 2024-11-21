import { PrismaClient } from "@prisma/client";

const PaymentModel = new PrismaClient().payment_gateway;

export default PaymentModel;
