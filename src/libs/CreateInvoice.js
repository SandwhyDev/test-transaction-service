import md5 from "md5";
import { GenerateDate, GenerateInvoiceID } from "./HandleGenerate";
import InvoiceModel from "../models/InvoiceModel";
import HandleBigInt from "./HandleBigInt";

export const CreateInvoice = async (data) => {
  try {
    const date = await GenerateDate();
    const unixTimestampExpire = Math.floor(new Date(data.expired).getTime() / 1000);

    const payment_method =
      {
        va: `VA-${data.payment_channel.toUpperCase()}`,
        qris: `QRIS`,
        cstore: data.payment_channel.toUpperCase(),
      }[data.payment_method] || "";

    const id = await md5(`${data.unique_id}-${data.total_bill}-${date}`);

    // const datenow = new Date();
    // const formattedDate = [
    //   datenow.getFullYear(),
    //   (datenow.getMonth() + 1).toString().padStart(2, "0"),
    //   datenow.getDate(),
    // ].join("/");

    // const invoice_id = `INV/TMP/${formattedDate}/${date}`;
    const invoice_id = data.invoice_id;

    const commonData = {
      status: "unpaid",
      total_shopping: data.total_shopping,
      description: data.description,
      shipping_cost: data.shipping_cost,
      payment_fee: data.fee,
      shipping_information: data.shipping_information,
      total_bill: data.total_bill,
      store_name: data.store_name,
      customer_name: data.customer_name,
      payment_method: payment_method,
      payment_code: data.payment_code,
      merchant_name: data.merchant,
      updated: date,
      expiry_date: unixTimestampExpire,
    };

    const create = await InvoiceModel.upsert({
      where: { invoice_id },
      create: {
        unique_id: id,
        invoice_id,
        client_id: data.client_id,
        invoice_items: {
          createMany: { data: data.items },
        },
        created: date,
        ...commonData,
      },
      update: {
        ...commonData,
      },
    });

    const result = await HandleBigInt(create);

    return {
      status: 201,
      success: true,
      message: result,
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      message: error.message,
    };
  }
};
