import { InvoiceModel } from "../models/model";
import { GenerateDate, GenerateInvoiceID } from "./HandleGenerate";

export const CreateInvoice = async (data) => {
  try {
    const id = await GenerateInvoiceID();
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

    const create = await InvoiceModel.create({
      data: {
        unique_id: data.unique_id,
        invoice_id: id,
        status: "unpaid",
        total_shopping: data.total_tagihan,
        total_bill: data.amount,
        description: data.description,
        shipping_cost: data.shippingCost,
        payment_fee: data.fee,
        store_name: data.storeName,
        user_name: data.customerName,
        payment_method: payment_method,
        payment_code: data.payment_code,
        merchant_name: data.merchant,
        client_name: data.client_name,
        shipping_information: data.shippingInformation,
        created: date,
        updated: date,
        expiry_date: unixTimestampExpire,
        invoice_items: {
          createMany: {
            data: data.items,
          },
        },
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
