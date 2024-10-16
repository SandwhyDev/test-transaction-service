import { InvoiceModel } from "../../models/model";
import { GenerateDate, GenerateInvoiceID } from "../HandleGenerate";
import { pm, pr } from "./xendit";

const model = InvoiceModel;

export const CreateVaXendit = async (channelCode, amount, items, shipping_cost) => {
  try {
    const id = await GenerateInvoiceID();
    const date = await GenerateDate();
    const fee = 4400;

    let total_tagihan = fee + shipping_cost;

    for (const e of items) {
      const total = e.unit_price * e.quantity;

      e.total_price = total;

      total_tagihan += total;
    }

    const fixedAcc = await pr.createPaymentRequest({
      data: {
        currency: "IDR",
        amount: total_tagihan,
        paymentMethod: {
          type: "VIRTUAL_ACCOUNT",
          reusability: "MULTIPLE_USE",
          referenceId: id,
          virtualAccount: {
            channelCode: channelCode,
            channelProperties: {
              customerName: "sandtuy",
              ...(channelCode === "BRI" || channelCode === "MANDIRI" ? { suggestedAmount: amount } : {}),
            },
          },
        },
      },
    });

    const create = await model.create({
      data: {
        invoice_id: id,
        status: "unpaid",
        total_bill: total_tagihan,
        total_shopping: amount,
        description: fixedAcc.description,
        store_name: "arn sports",
        user_name: "sands",
        payment_fee: 4400,
        shipping_cost: shipping_cost,
        payment_method: `VA-${channelCode}-${fixedAcc.paymentMethod.virtualAccount.channelProperties.virtualAccountNumber}`,
        created: date,
        updated: date,
        invoice_items: {
          createMany: {
            data: items,
          },
        },
      },
    });

    return {
      status: true,
      // message: fixedAcc,
    };
  } catch (e) {
    console.log(e);

    return {
      status: false,
      message: e.message,
    };
  }
};

export const ReadAllVa = async (type) => {
  try {
    const retrievedAcc = await pm.getAllPaymentMethods({
      type: type,
    });

    return {
      status: true,
      message: retrievedAcc,
    };
  } catch (error) {
    return {
      status: false,
      message: error,
    };
  }
};

export const ReadVaById = async (id) => {
  try {
    const retrievedAcc = await pm.getPaymentMethodByID({
      paymentMethodId: id,
    });

    return {
      status: true,
      message: retrievedAcc,
    };
  } catch (error) {
    return {
      status: false,
      message: error,
    };
  }
};

export const updateVa = async (id, suggested_amt, expected_amt) => {
  try {
    const updatedAcc = await pm.updateFixedVA({
      id: id,
      suggestedAmt: suggested_amt,
      expectedAmt: expected_amt,
    });

    return updatedAcc;
  } catch (error) {
    return error;
  }
};

export const GetBankVa = async () => {
  try {
    const banks = await pm.getVABanks();
    return banks;
  } catch (error) {
    return error;
  }
};

export const SimulateVa = async (id, amount) => {
  try {
    const simulate = await pm.simulatePayment({
      paymentMethodId: id,
      data: {
        amount: amount,
      },
    });

    return {
      status: true,
      message: simulate,
    };
  } catch (error) {
    console.log(error);

    return {
      status: false,
      message: error,
    };
  }
};
