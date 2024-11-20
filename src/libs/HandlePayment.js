import { DirectPaymentIpaymu } from "./ipaymu/VaPaymentIpaymu";
import { CreateVaXendit } from "./xendit/VirtualAccountXendit";

export const handleEscrowPayment = async (signature, data, commonInvoiceData) => {
  const amount = data.total_shopping + data.shipping_cost;
  const paymentResponse = await DirectPaymentIpaymu(signature, {
    customerName: data.customerName,
    phoneNumber: data.phoneNumber,
    email: data.email,
    amount: amount,
    paymentMethod: data.paymentMethod,
    paymentChannel: data.paymentChannel,
    referenceId: data.invoice_id,
  });

  if (!String(paymentResponse.status).startsWith("2")) {
    throw new Error(paymentResponse.message);
  }

  const payment_code = data.paymentMethod === "qris" ? paymentResponse.data.QrImage : paymentResponse.data.PaymentNo;
  const invoiceData = {
    ...commonInvoiceData,
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

export const handleNonEscrowPayment = async (signature, data, commonInvoiceData, merchant = "XENDIT") => {
  const paymentResponse = await CreateVaXendit(signature, {
    invoice_id: data.invoice_id,
    paymentChannel: data.paymentChannel,
    total_shopping: data.total_shopping,
    // items: data.items,
    shipping_cost: data.shipping_cost,
    customerName: data.customerName,
    phoneNumber: data.phoneNumber,
  });

  if (!paymentResponse?.status) {
    throw new Error(paymentResponse.message);
  }

  const invoiceData = {
    ...commonInvoiceData,
    unique_id: paymentResponse.message.referenceId,
    total_bill: paymentResponse.message.amount,
    total_shopping: data.total_shopping,
    fee: paymentResponse.fee,
    payment_code: paymentResponse.message.paymentMethod.virtualAccount.channelProperties.virtualAccountNumber,
    merchant: merchant,
  };

  return { invoiceData };
};
