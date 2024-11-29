import { response } from "express";
import { GenerateDate } from "./HandleGenerate";
import InvoiceModel from "../models/InvoiceModel";
import HandleBigInt from "./HandleBigInt";

/**
 * Handle callback untuk memperbarui status invoice berdasarkan client tertentu
 * @param {string} invoice_id - ID invoice yang akan diperbarui
 * @param {string} status - Status terbaru untuk invoice (misalnya "paid")
 * @returns {Object} Hasil respons callback dengan status dan pesan
 */
export const HandleCallback = async (invoice_id, status) => {
  const date = await GenerateDate();

  // Cek apakah invoice ada di database
  const cekInvoice = await InvoiceModel.findUnique({
    where: { invoice_id },
    include: { client: true },
  });

  // Jika invoice tidak ditemukan, kembalikan status gagal
  if (!cekInvoice) {
    return {
      status: false,
      message: "Invoice tidak ditemukan",
    };
  }

  let cekResponse;

  // Tentukan respons berdasarkan nama client
  switch (cekInvoice.client.name) {
    case "trumecs":
      // Proses callback khusus untuk client "trumecs"
      const sendClient = await HandleCallbackClientTrumecs(invoice_id, status);
      cekResponse = {
        status: true,
        message: sendClient.message,
      };
      break;

    case "togu":
      // Respons untuk client "togu"
      cekResponse = {
        status: true,
        message: "togu",
      };
      break;

    default:
      // Respons jika client tidak diketahui
      cekResponse = {
        status: false,
        message: "Client tidak terdaftar",
      };
      break;
  }

  // Update status invoice dan set `paid_at` jika statusnya "paid"
  let update = await InvoiceModel.update({
    where: { unique_id: cekInvoice.unique_id },
    data: {
      status,
      ...(status === "paid" && { paid_at: date }),
      updated: date,
    },
  });

  if (!update) {
    return {
      status: false,
      message: cekResponse,
      data: update,
    };
  }

  update = await HandleBigInt(update);

  cekResponse = { ...cekResponse, data: update };

  return cekResponse;
};

/**
 * Mengirim permintaan pembaruan status invoice ke API client Trumecs
 * @param {string} invoice_id - ID invoice yang akan diperbarui
 * @param {string} status - Status terbaru untuk invoice
 * @returns {Object} Hasil respons dari API dengan status dan pesan
 */
export const HandleCallbackClientTrumecs = async (invoice_id, status) => {
  try {
    const url = "http://192.168.1.228:5001";
    // const url = "https://192.168.1.228:5001";
    const date = await GenerateDate();

    // Data yang akan dikirim ke API
    const dataApi = {
      updated: date,
      paid_at: date,
      status,
    };

    // Mengirim request ke API Trumecs untuk memperbarui status invoice
    const response = await fetch(`${url}/api/invoice-update/${invoice_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataApi),
    });

    // Parsing hasil respons
    const createPayment = await response.json();

    // Mengembalikan status dan pesan dari API
    return {
      success: createPayment.status,
      message: createPayment.message,
    };
  } catch (error) {
    // Menangani error jika terjadi masalah dalam proses
    return {
      success: false,
      message: error.message,
    };
  }
};
