import { ClientModel } from "../models/model";

export const FindClient = async (name) => {
  try {
    const find = await ClientModel.findUnique({
      where: {
        name: name,
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
