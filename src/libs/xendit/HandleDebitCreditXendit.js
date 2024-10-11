import { pm } from "./xendit";

export const CreateDirectDebitXendit = async () => {
  try {
    const create = await pm.createPaymentMethod({
      data: {
        customerId: "cust-6c22e44e-ea70-4f0a-8092-df327c9b6245",
        reusability: "MULTIPLE_USE",
        type: "DIRECT_DEBIT",
        directDebit: {
          channelCode: "BCA_KLIKPAY",
          channelProperties: {
            accountNumber: "",
            mobileNumber: "+62818555988",
            cardLastFour: "1234",
            cardExpiry: "12/24",
            email: "email@email.com",
          },
        },
      },
    });

    return {
      success: true,
      message: create,
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};
