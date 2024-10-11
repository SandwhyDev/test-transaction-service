import Xendit from "xendit-node";
import env from "dotenv";
const envFile = process.env.XENDIT_KEY === "production" ? ".env.production" : ".env.development";

env.config({
  path: envFile,
});

const x = new Xendit({
  secretKey: process.env.XENDIT_KEY,
});

export const pm = x.PaymentMethod;
export const pr = x.PaymentRequest;
export const c = x.Customer;

export const SimulatePaymentRequest = async (id) => {
  try {
    const payment = await pr.simulatePaymentRequestPayment({
      paymentRequestId: "pr-229f6a44-a3e1-4be6-98e5-772b0e941059",
    });

    return {
      success: true,
      message: payment,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: error,
    };
  }
};

export const SimulatePaymentMethod = async (id, amount) => {
  try {
    const payment = await pm.simulatePayment({
      paymentMethodId: id,
      data: {
        amount: amount,
      },
    });

    console.log(payment);

    return {
      success: true,
      message: payment,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: error,
    };
  }
};
