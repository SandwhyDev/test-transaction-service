import express from "express";
import { CreateVaXendit, ReadAllVa, ReadVaById } from "../libs/xendit/VirtualAccountXendit";
import { pr, SimulatePaymentMethod } from "../libs/xendit/xendit";
import env from "dotenv";
import { GenerateDate } from "../libs/HandleGenerate";
import { FindClient } from "../libs/FindClient";
import { DirectPaymentIpaymu } from "../libs/ipaymu/VaPaymentIpaymu";
import { CreateInvoice } from "../libs/CreateInvoice";
import { HandleTotalTagihan } from "../libs/HandleTotalTagihan";
import { InvoiceModel } from "../models/model";
import { HandleCallback, HandleCallbackClientTrumecs } from "../libs/CallbackClient";
import HandleBigInt from "../libs/HandleBigInt";

const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";

env.config({
  path: envFile,
});

const TransactionXenditControllers = express.Router();

// create
TransactionXenditControllers.post(`/transaction-create`, async (req, res) => {
  try {
    const data = req.body;
    const FindClientName = await FindClient(data.client);

    if (!FindClientName.success) {
      return res.status(404).json({ success: false, message: FindClientName.message });
    }

    // Hitung total tagihan
    let dataInvoice, paymentResponse, payment_code, create;

    if (data.escrow) {
      // const total = await HandleTotalTagihan(data.items, data.shippingCost);

      const amount = data.total_shopping + data.shippingCost;

      // Pembayaran via IPAYMU
      paymentResponse = await DirectPaymentIpaymu(FindClientName.message.ipaymu_key, {
        customerName: data.customerName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        amount: amount,
        paymentMethod: data.paymentMethod,
        paymentChannel: data.paymentChannel,
        referenceId: data.invoice_id,
      });

      if (!String(paymentResponse.status).startsWith("2")) {
        return res.status(paymentResponse.status).json({ success: false, message: paymentResponse.message });
      }

      payment_code = data.paymentMethod === "qris" ? paymentResponse.data.QrImage : paymentResponse.data.PaymentNo;
      dataInvoice = {
        unique_id: paymentResponse.data.SessionId,
        method: data.paymentMethod,
        channel: data.paymentChannel,
        total_bill: paymentResponse.data.Total,
        total_shopping: paymentResponse.data.SubTotal,
        description: data.description,
        shipping_cost: data.shippingCost,
        fee: paymentResponse.data.Fee,
        storeName: data.storeName,
        customerName: data.customerName,
        payment_code,
        shippingInformation: data.shippingInformation,
        items: data.items,
        merchant: "IPAYMU",
        // client_name: FindClientName.message.name,
        expired: paymentResponse.data.Expired,
      };
    } else {
      const dataXendit = {
        invoice_id: data.invoice_id,
        paymentChannel: data.paymentChannel,
        total_shopping: data.total_shopping,
        items: data.items,
        shippingCost: data.shippingCost,
        customerName: data.customerName,
        phoneNumber: data.phoneNumber,
      };

      // Pembayaran via XENDIT
      create = await CreateVaXendit(FindClientName.message.xendit_key, dataXendit);

      if (!create?.status) {
        return res.status(500).json({ success: false, message: create.message });
      }

      dataInvoice = {
        unique_id: create.message.referenceId,
        method: data.paymentMethod,
        channel: data.paymentChannel,
        total_bill: create.message.amount,
        total_tagihan: create.total_shopping,
        description: data.description,
        shipping_cost: data.shippingCost,
        fee: create.fee,
        storeName: data.storeName,
        customerName: data.customerName,
        payment_code: create.message.paymentMethod.virtualAccount.channelProperties.virtualAccountNumber,
        shippingInformation: data.shippingInformation,
        items: data.items,
        merchant: "XENDIT",
        // client_name: FindClientName.message.name,
        // expired: create.message.paymentMethod.virtualAccount.channelProperties?.expiresAt,
      };
    }

    dataInvoice.invoice_id = data.invoice_id;
    dataInvoice.client_id = FindClientName.message.uid;

    // Buat invoice ke database
    const createInvoice = await CreateInvoice(dataInvoice);
    if (createInvoice.status === 500) {
      return res.status(500).json({ success: false, message: createInvoice.message });
    }

    res.status(201).json({ success: true, message: "berhasil", data: dataInvoice });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// create escrow
TransactionXenditControllers.post(`/transaction-escrow-create`, async (req, res) => {
  try {
    const data = req.body;

    // Validasi client
    const clientResult = await FindClient(data.client);
    if (!clientResult.success) {
      return res.status(404).json({ success: false, message: clientResult.message });
    }

    // Hitung total tagihan
    const total = await HandleTotalTagihan(data.items, data.shippingCost);

    // Request pembayaran
    const paymentData = {
      customerName: data.customerName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      amount: total.total_bill,
      paymentMethod: data.paymentMethod,
      paymentChannel: data.paymentChannel,
    };
    const paymentResponse = await DirectPaymentIpaymu(paymentData);

    if (!String(paymentResponse.status).startsWith("2")) {
      return res.status(paymentResponse.status).json({ success: false, message: paymentResponse.message });
    }

    // Tentukan kode pembayaran
    const payment_code = data.paymentMethod === "qris" ? paymentResponse.data.QrImage : paymentResponse.data.PaymentNo;

    // Buat invoice
    const invoiceData = {
      unique_id: paymentResponse.data.SessionId,
      method: data.paymentMethod,
      channel: data.paymentChannel,
      amount: paymentResponse.data.Total,
      total_tagihan: total.total_shopping,
      description: data.description,
      shippingCost: data.shippingCost,
      fee: paymentResponse.data.Fee,
      storeName: data.storeName,
      customerName: data.customerName,
      payment_code,
      shippingInformation: data.shippingInformation,
      items: data.items,
      merchant: "IPAYMU",
      client_name: clientResult.message.name,
      expired: paymentResponse.data.Expired,
    };

    const invoiceResponse = await CreateInvoice(invoiceData);
    if (invoiceResponse.status === 500) {
      return res.status(500).json({ success: false, message: invoiceResponse.message });
    }

    // Berhasil
    res.status(201).json({ success: true, message: "berhasil", data: paymentResponse.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// simulate payment
TransactionXenditControllers.post(`/transaction-payment/:id`, async (req, res) => {
  try {
    const { id } = await req.params;
    const { amount } = await req.body;
    const pay = await SimulatePaymentMethod(id, amount);

    if (!pay.success) {
      return res.status(500).json({
        success: false,
        message: pay.message,
      });
    }

    console.log(pay);

    res.status(201).json({
      success: true,
      message: "berhasil",
      data: pay,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// read payment methodd
TransactionXenditControllers.get(`/transaction-read/:uid?`, async (req, res) => {
  try {
    const { uid } = await req.params;
    var result;

    if (uid) {
      const find = await InvoiceModel.findUnique({
        where: {
          unique_id: uid,
        },
        include: {
          client: true,
        },
      });

      if (!find) {
        return res.status(404).json({
          success: false,
          message: "data tidak ditemukan",
        });
      }

      result = find;
    } else {
      const find = await InvoiceModel.findMany({
        include: {
          client: true,
        },
      });

      result = find;
    }

    result = await HandleBigInt(result);

    res.status(200).json({
      success: true,
      message: "berhasil",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// read payment request
TransactionXenditControllers.get(`/transaction-request-read/:uid?`, async (req, res) => {
  try {
    const { uid } = await req.params;
    var result;

    if (uid) {
      const find = await pr.getPaymentRequestByID({
        paymentRequestId: uid,
      });

      if (!find.status) {
        return res.status(404).json({
          success: false,
          message: "data tidak ditemukan",
        });
      }

      result = find;
    } else {
      const find = await pr.getAllPaymentRequests();

      result = find;
    }

    res.status(200).json({
      success: true,
      message: "berhasil",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// update
TransactionXenditControllers.put(`/transaction-update`, async (req, res) => {
  try {
    const data = await req.body;

    // const update = await model.update({
    //   where: {
    //     id: +data.id,
    //   },
    //   data: data,
    // });

    res.status(200).json({
      success: true,
      message: "berhasil update",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// delete
TransactionXenditControllers.delete(`/transaction-delete/:id`, async (req, res) => {
  try {
    const { id } = await req.params;

    // const hapus = await model.delete({
    //   where: {
    //     id: +id,
    //   },
    // });

    res.status(200).json({
      success: true,
      message: "berhasil update",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// CALLBACK URL PAYMENT METHODS
TransactionXenditControllers.post("/xendit_payment_methods_callback", async (req, res) => {
  try {
    const header = await req.headers;
    const callback_token = header["x-callback-token"];
    const data = await req.body;
    const date = await GenerateDate();

    const WEBHOOK_CALLBACK = "sjhKUaRs27cBB5rIFulcWzTedOi5RQufoHKiRgseeh82GFAw";

    if (callback_token === WEBHOOK_CALLBACK) {
      // const update = await InvoiceModel.update({
      //   where: {
      //     unique_id: data.data.reference_id,
      //   },
      //   data: {
      //     status: "paid",
      //     paid_at: date,
      //     updated: date,
      //   },
      // });

      res.status(200).json({
        status: true,
        message: "berhasil",
        payload: data,
      });
    } else {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Access denied");
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

// CALLBACK URL PAYMENT REQUESTS SUCCEED
TransactionXenditControllers.post("/xendit_callback_request_succeed", async (req, res) => {
  try {
    const header = await req.headers;
    const callback_token = header["x-callback-token"];
    const data = await req.body;
    const date = await GenerateDate();
    var status;

    const WEBHOOK_CALLBACK = process.env.WEBHOOK_CALLBACK;

    if (callback_token === WEBHOOK_CALLBACK) {
      status = "paid";

      const sendClient = await HandleCallback(data.data.reference_id, status);

      if (!sendClient.status) {
        return res.status(500).json({
          status: false,
          message: sendClient.message,
        });
      }

      res.status(200).json({
        status: true,
        message: "payment request succeed",
        payload: data,
      });
    } else {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Access denied");
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

// CALLBACK URL PAYMENT REQUESTS FAILED
TransactionXenditControllers.post("/xendit_callback_request_failed", async (req, res) => {
  try {
    const header = await req.headers;
    const callback_token = header["x-callback-token"];
    const data = await req.body;
    const date = await GenerateDate();

    const WEBHOOK_CALLBACK = "sjhKUaRs27cBB5rIFulcWzTedOi5RQufoHKiRgseeh82GFAw";

    if (callback_token === WEBHOOK_CALLBACK) {
      // const update = await InvoiceModel.update({
      //   where: {
      //     unique_id: data.data.reference_id,
      //   },
      //   data: {
      //     status: "failed",
      //     updated: date,
      //   },
      // });

      res.status(200).json({
        status: true,
        message: "payment request failed",
        payload: data,
      });
    } else {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Access denied");
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

// CALLBACK URL PAYMENT REQUESTS PENDING
TransactionXenditControllers.post("/xendit_callback_request_pending", async (req, res) => {
  try {
    const header = await req.headers;
    const callback_token = header["x-callback-token"];
    const data = await req.body;
    const date = await GenerateDate();

    const WEBHOOK_CALLBACK = "sjhKUaRs27cBB5rIFulcWzTedOi5RQufoHKiRgseeh82GFAw";

    if (callback_token === WEBHOOK_CALLBACK) {
      // const update = await InvoiceModel.update({
      //   where: {
      //     unique_id: data.data.reference_id,
      //   },
      //   data: {
      //     status: "pending",
      //     updated: date,
      //   },
      // });

      res.status(200).json({
        status: true,
        message: "payment request pending",
        payload: data,
      });
    } else {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Access denied");
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

// CALLBACK IPAYMU
TransactionXenditControllers.post("/ipaymu-callback", async (req, res) => {
  try {
    const data = await req.body;
    const date = await GenerateDate();

    var status;

    switch (data.status_code) {
      case "0":
        status = "pending";
        break;
      case "1":
        status = "paid";
        break;
      case "-2":
        status = "expired";
        break;

      default:
        break;
    }

    const sendClient = await HandleCallback(data.reference_id, status);

    if (!sendClient.status) {
      return res.status(500).json({
        status: false,
        message: sendClient.message,
      });
    }

    res.status(200).json({
      status: true,
      message: "payment ipaymu",
      client: sendClient.message,
      payload: data,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

export default TransactionXenditControllers;
