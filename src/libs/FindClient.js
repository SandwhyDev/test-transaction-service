import { AppModel, ClientModel } from "../models/model";

export const FindClient = async (name) => {
  try {
    const findApp = await AppModel.findUnique({
      where: {
        name: name,
      },
    });

    if (!findApp) {
      return {
        success: false,
        message: "app tidak terdaftar",
      };
    }

    const find = await ClientModel.findUnique({
      where: {
        uid: findApp.client_id,
      },
    });

    if (!find) {
      return {
        success: false,
        message: "client tidak ditemukan",
      };
    }

    return {
      success: true,
      message: find,
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};
