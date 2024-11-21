import { AppModel, ClientModel } from "../models/model";

export const FindClient = async (AppName, merchant) => {
  try {
    // find app
    const app = await AppModel.findUnique({ where: { name: AppName } });
    if (!app) return { success: false, message: "app tidak terdaftar" };

    // find client dan payment yang terdaftar
    const client = await ClientModel.findUnique({
      where: {
        unique_id: app.client_id,
        payment_gateway: { some: { name: merchant } },
      },
      include: { payment_gateway: true },
    });
    if (!client) return { success: false, message: `client tidak terdaftar pada merchant payment ${merchant}` };

    // find payment
    const payment = client.payment_gateway.find((pg) => pg.name === merchant);
    if (!payment) return { success: false, message: "merchant payment tidak ditemukan" };

    return { success: true, message: { client_id: client.unique_id, signature: payment.signature } };
  } catch (error) {
    return { success: false, message: error };
  }
};
