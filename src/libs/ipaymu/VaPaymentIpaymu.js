import CryptoJS from "crypto-js";
import md5 from "md5";
import { GenerateDate } from "../HandleGenerate";
import env from "dotenv";
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";

env.config({
  path: envFile,
});

// Konfigurasi iPaymu API
const apikey = process.env.IPAYMU_KEY;
const va = process.env.IPAYMU_VA;
const url = process.env.URL_PAY_IPAYMU;
const callback_url = process.env.CALLBACK_URL_IPAYMU;

/**
 * Melakukan pembayaran langsung ke iPaymu
 *
 * @param {Object} data - Data yang diperlukan untuk melakukan pembayaran
 * @param {String} data.customer_name - Nama pelanggan
 * @param {String} data.phone_number - Nomor telepon pelanggan
 * @param {String} data.email - Email pelanggan
 * @param {Number} data.amount - Jumlah pembayaran
 * @param {String} data.payment_method - Metode pembayaran (cc, qris, va, cstore)
 * @param {String} [data.payment_channel] - Channel pembayaran (jika metode pembayaran menggunakan `va` atau `cstore`)
 *
 * @returns {Promise<Object>} Hasil dari proses pembayaran, termasuk status, success, dan pesan dari API.
 *
 * @example
 * const DataPayment = {
 *   customer_name: "John Doe",
 *   phone_number: "08123456789",
 *   email: "johndoe@email.com",
 *   amount: 500000,
 *   payment_method: "va",
 *   payment_channel: "bca"
 * };
 *
 * DirectPaymentIpaymu(DataPayment)
 *   .then(response => {
 *     console.log(response);
 *   })
 *   .catch(error => {
 *     console.error(error);
 *   });
 */
export const DirectPaymentIpaymu = async (key, data) => {
  // Struktur body request
  let body = {
    name: data.customer_name,
    phone: data.phone_number,
    email: data.email,
    amount: data.amount,
    comments: data.comments,
    notifyUrl: callback_url,
    referenceId: data.referenceId,
    escrow: true,
    feeDirection: "BUYER",
  };

  // Menentukan metode pembayaran
  if (data.payment_method === "va") {
    body = { ...body, paymentMethod: "va", paymentChannel: data.payment_channel };
  } else if (["cc", "qris"].includes(data.payment_method)) {
    body.paymentMethod = data.payment_method;
  } else if (data.payment_method === "cstore") {
    body = { ...body, paymentMethod: "cstore", paymentChannel: data.payment_channel };
  }

  // Generate signature
  const bodyEncrypt = CryptoJS.SHA256(JSON.stringify(body));
  const stringToSign = `POST:${va}:${bodyEncrypt}:${key}`;
  const signature = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(stringToSign, apikey));

  // Mengirim request
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        va,
        signature,
      },
      body: JSON.stringify(body),
    });

    const responseJson = await response.json();
    return {
      status: responseJson.Status,
      success: responseJson.Success,
      message: responseJson.Message,
      data: responseJson.Data,
    };
  } catch (error) {
    return { status: "error", success: false, message: error.message };
  }
};

export const ReadPaymentIpaymu = async (trans_id) => {
  const url = "https://sandbox.ipaymu.com/api/v2/transaction"; // development mode
  let body = {
    transactionId: trans_id,
    // account: va,
  };

  // Generate signature
  const bodyEncrypt = CryptoJS.SHA256(JSON.stringify(body));
  const stringToSign = `POST:${va}:${bodyEncrypt}:${apikey}`;
  const signature = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(stringToSign, apikey));

  // Mengirim request
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        va,
        signature,
      },
      body: JSON.stringify(body),
    });

    const responseJson = await response.json();

    return {
      status: responseJson.Status,
      success: responseJson.Success,
      message: responseJson.Message,
      data: responseJson.Data,
    };
  } catch (error) {
    return { status: "error", success: false, message: error.message };
  }
};
