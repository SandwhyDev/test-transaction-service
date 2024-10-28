import md5 from "md5";
import { InvoiceModel } from "../../models/model";
import { GenerateDate, GenerateInvoiceID } from "../HandleGenerate";
import { pm, pr } from "./xendit";

const model = InvoiceModel;

export const CreateVaXendit = async (
  invoice_id,
  channelCode,
  amount,
  items,
  shipping_cost,
  customerName,
  phoneNumber
) => {
  try {
    const date = await GenerateDate();
    const fee = 4400;
    const total_shopping = amount;
    const ReferenceId = md5(`${customerName}-${phoneNumber}-${amount}-${date}`);

    // Buat salinan amount yang ditambahkan fee
    const totalAmount = amount + fee;

    const fixedAcc = await pr.createPaymentRequest({
      data: {
        currency: "IDR",
        amount: totalAmount,
        referenceId: invoice_id,
        paymentMethod: {
          type: "VIRTUAL_ACCOUNT",
          reusability: "MULTIPLE_USE",
          virtualAccount: {
            channelCode: channelCode,
            channelProperties: {
              customerName: customerName,
              ...(channelCode === "BRI" || channelCode === "MANDIRI" ? { suggestedAmount: totalAmount } : {}),
            },
          },
        },
      },
    });

    console.log(fixedAcc);

    return {
      status: true,
      message: fixedAcc,
      total_shopping: total_shopping,
      fee: fee,
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
