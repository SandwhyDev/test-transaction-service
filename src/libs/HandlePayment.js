import { DirectPaymentIpaymu } from "./ipaymu/VaPaymentIpaymu";
import { CreateVaXendit } from "./xendit/VirtualAccountXendit";

export const handleEscrowPayment = async (signature, data) => {
  const amount = data.total_shopping + data.shipping_cost;
  const paymentResponse = await DirectPaymentIpaymu(signature, {
    customer_name: data.customer_name,
    phone_number: data.phone_number,
    email: data.email,
    amount: amount,
    payment_method: data.payment_method,
    payment_channel: data.payment_channel,
    referenceId: data.invoice_id,
    comments: `${data.client_name}-${data.customer_name}-${amount}`,
  });

  if (!String(paymentResponse.status).startsWith("2")) {
    throw new Error(paymentResponse.message);
  }

  const payment_code = data.payment_method === "qris" ? paymentResponse.data.QrImage : paymentResponse.data.PaymentNo;
  const invoiceData = {
    ...data,
    unique_id: paymentResponse.data.SessionId,
    total_bill: paymentResponse.data.Total,
    total_shopping: data.total_shopping,
    fee: paymentResponse.data.Fee,
    payment_code,
    merchant: "IPAYMU",
    expired: paymentResponse.data.Expired,
  };

  return { invoiceData };
};

export const handleNonEscrowPayment = async (signature, data, merchant = "XENDIT") => {
  const paymentResponse = await CreateVaXendit(signature, {
    invoice_id: data.invoice_id,
    payment_channel: data.payment_channel,
    total_shopping: data.total_shopping,
    items: data.items,
    shipping_cost: data.shipping_cost,
    customer_name: data.customer_name,
    phone_number: data.phone_number,
  });

  if (!paymentResponse?.status) {
    throw new Error(paymentResponse.message);
  }

  const invoiceData = {
    ...data,
    unique_id: paymentResponse.message.referenceId,
    total_bill: paymentResponse.message.amount,
    total_shopping: data.total_shopping,
    fee: paymentResponse.fee,
    payment_code: paymentResponse.message.paymentMethod.virtualAccount.channelProperties.virtualAccountNumber,
    merchant: merchant,
  };

  return { invoiceData };
};
