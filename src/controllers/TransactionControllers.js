import express from "express";
import { CreateVaXendit, ReadAllVa, ReadVaById } from "../libs/xendit/VirtualAccountXendit";
// import { pr, SimulatePaymentMethod } from "../libs/xendit/xendit";
import env from "dotenv";
import { GenerateDate } from "../libs/HandleGenerate";
import { FindClient } from "../libs/FindClient";
import { DirectPaymentIpaymu } from "../libs/ipaymu/VaPaymentIpaymu";
import { CreateInvoice } from "../libs/CreateInvoice";
import { HandleItems, HandleTotalTagihan } from "../libs/HandleTotalTagihan";
import { HandleCallback, HandleCallbackClientTrumecs } from "../libs/CallbackClient";
import HandleBigInt from "../libs/HandleBigInt";
import { handleEscrowPayment, handleNonEscrowPayment } from "../libs/HandlePayment";
import InvoiceModel from "../models/InvoiceModel";

const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";

env.config({
  path: envFile,
});

const TransactionXenditControllers = express.Router();

const model = InvoiceModel;

// create
TransactionXenditControllers.post(`/transaction-create`, async (req, res) => {
  try {
    const data = req.body;
    const merchant = data.escrow ? "ipaymu" : "xendit";
    const FindClientName = await FindClient(data.client, merchant);

    if (!FindClientName.success) {
      return res.status(404).json({ success: false, message: FindClientName.message });
    }

    const Tagihan = await HandleItems(data.items);

    let dataInvoice = {
      ...data,
      client_id: FindClientName.message.client_id,
      client_name: FindClientName.message.client_name,
      total_shopping: Tagihan,
    };

    const paymentResult = data.escrow
      ? await handleEscrowPayment(FindClientName.message.signature, dataInvoice)
      : await handleNonEscrowPayment(FindClientName.message.signature, dataInvoice);

    // Buat invoice ke database
    const createInvoice = await CreateInvoice(paymentResult.invoiceData);
    if (createInvoice.status === 500) {
      return res.status(500).json({ success: false, message: createInvoice.message });
    }

    res.status(201).json({ success: true, message: "berhasil", data: createInvoice.message });
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

    const find = await model.findUnique({
      where: {
        unique_id: id,
      },
    });

    if (!find) {
      return res.status(404).json({
        success: false,
        message: "data tidak ditemukan",
      });
    }

    const hapus = await model.delete({
      where: {
        unique_id: id,
      },
    });

    res.status(200).json({
      success: true,
      message: "berhasil delete",
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
    // const date = await GenerateDate();

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
      // client: sendClient.message,
      payload: sendClient.data,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

export default TransactionXenditControllers;
