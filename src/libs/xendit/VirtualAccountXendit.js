import md5 from "md5";
import { GenerateDate, GenerateInvoiceID } from "../HandleGenerate";
import { pm, pr } from "./xendit";
import { calculateFee } from "../HandleFee";
import Xendit from "xendit-node";

export const CreateVaXendit = async (signature, data) => {
  try {
    // const date = await GenerateDate();
    // const expiresAt = new Date();
    // expiresAt.setDate(expiresAt.getDate() + 1);
    // const expiresAtISO = expiresAt.toISOString();
    // console.log("expires_at:", expiresAtISO);

    const fee = await calculateFee(data.total_shopping, "va");

    // Buat salinan amount yang ditambahkan fee
    const totalAmount = data.total_shopping + data.shipping_cost + fee;

    const request = new Xendit({
      secretKey: signature,
    }).PaymentRequest;

    if (!Number.isInteger(totalAmount)) {
      return {
        status: false,
        message: "error di perhitungan",
      };
    }

    const fixedAcc = await request.createPaymentRequest({
      data: {
        currency: "IDR",
        amount: totalAmount,
        referenceId: data.invoice_id,
        paymentMethod: {
          type: "VIRTUAL_ACCOUNT",
          reusability: "MULTIPLE_USE",
          virtualAccount: {
            channelCode: data.payment_channel,
            channelProperties: {
              // expiresAt: "2024-11-06T03:42:45.360833959Z",
              customerName: data.customer_name,
              ...(data.payment_channel === "BRI" || data.payment_channel === "MANDIRI"
                ? { suggestedAmount: totalAmount }
                : {}),
            },
          },
        },
      },
    });

    return {
      status: true,
      message: fixedAcc,
      total_shopping: data.total_shopping,
      fee: fee,
    };
  } catch (e) {
    return {
      status: false,
      message: e.response,
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
    return {
      status: false,
      message: error,
    };
  }
};
