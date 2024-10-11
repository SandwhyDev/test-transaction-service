import { pm } from "./xendit";

export const CreateEWalletXendit = async (
  channelCode,
  amount,
  customerId = "cust-6c22e44e-ea70-4f0a-8092-df327c9b6245"
) => {
  try {
    const fixedAcc = await pm.createPaymentMethod({
      data: {
        type: "EWALLET",
        reusability: "MULTIPLE_USE",
        customerId: customerId,
        country: "ID",
        ewallet: {
          channelCode: channelCode,
          channelProperties: {
            mobileNumber: "081217333000",
            successReturnUrl: "https://redirect.me/goodstuff",
            failureReturnUrl: "https://redirect.me/badstuff",
          },
        },
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
