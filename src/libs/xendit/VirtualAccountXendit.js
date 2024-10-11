import { GenerateInvoiceID } from "../HandleGenerate";
import { pm, pr } from "./xendit";

export const CreateVaXendit = async (channelCode, amount) => {
  try {
    const id = GenerateInvoiceID();

    const fixedAcc = await pr.createPaymentRequest({
      data: {
        currency: "IDR",
        amount: amount,
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
        items: [
          {
            currency: "IDR",
            referenceId: "PRD123",
            category: "Ban",
            name: "ban tubles",
            price: 10000,
            quantity: 1,
            type: "PHYSICAL_PRODUCT",
          },
        ],
      },
    });

    return {
      status: true,
      message: fixedAcc,
    };
  } catch (e) {
    return {
      status: false,
      message: e,
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
