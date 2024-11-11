import md5 from "md5";
import { InvoiceModel } from "../models/model";
import { GenerateDate, GenerateInvoiceID } from "./HandleGenerate";

export const CreateInvoice = async (data) => {
  try {
    const date = await GenerateDate();
    const Expiredate = new Date(data.expired);
    const unixTimestampExpire = Math.floor(Expiredate.getTime() / 1000);

    var payment_method;
    switch (data.method) {
      case "va":
        payment_method = `VA-${data.channel.toUpperCase()}`;
        break;
      case "qris":
        payment_method = `QRIS`;
        break;
      case "cstore":
        payment_method = `${data.channel.toUpperCase()}`;
        break;

      default:
        break;
    }

    const id = await md5(`${data.unique_id}-${data.total_bill}-${date}`);

    const create = await InvoiceModel.upsert({
      where: {
        invoice_id: data.invoice_id,
      },
      create: {
        unique_id: id,
        invoice_id: data.unique_id,
        status: "unpaid",
        // total_shopping: data.total_shopping,
        // description: data.description,
        // shipping_cost: data.shippingCost,
        // payment_fee: data.fee,
        // shipping_information: data.shippingInformation,
        total_bill: data.total_bill,
        store_name: data.storeName,
        customer_name: data.customerName,
        payment_method: payment_method,
        payment_code: data.payment_code,
        merchant_name: data.merchant,
        client_name: data.client_name,
        created: date,
        updated: date,
        expiry_date: unixTimestampExpire,
      },
      update: {
        status: "unpaid",
        // total_shopping: data.total_shopping,
        // description: data.description,
        // shipping_cost: data.shippingCost,
        // payment_fee: data.fee,
        // shipping_information: data.shippingInformation,
        total_bill: data.total_bill,
        store_name: data.storeName,
        customer_name: data.customerName,
        payment_method: payment_method,
        payment_code: data.payment_code,
        merchant_name: data.merchant,
        client_name: data.client_name,
        created: date,
        updated: date,
        expiry_date: unixTimestampExpire,
      },
    });

    return {
      status: 201,
      success: true,
      message: create,
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      message: error.message,
    };
  }
};
