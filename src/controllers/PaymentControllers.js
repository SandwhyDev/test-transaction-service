import express from "express";
import md5 from "md5";
import PaymentModel from "../models/PaymentModel";

const PaymentGatewayControllers = express.Router();

const model = PaymentModel;

// create
PaymentGatewayControllers.post(`/payment-client-create`, async (req, res) => {
  try {
    const data = await req.body;

    const unique_id = await md5(`${data.name}-${data.signature}-${data.client_id}`);

    const create = await model.create({
      data: {
        unique_id: unique_id,
        name: data.name,
        signature: data.signature,
        client_id: data.client_id,
      },
    });

    res.status(201).json({
      success: true,
      message: "berhasil",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// read
PaymentGatewayControllers.get(`/payment-client-read/:uid?`, async (req, res) => {
  try {
    const { uid } = await req.params;
    var result;

    if (uid) {
      const find = await model.findUnique({
        where: {
          unique_id: uid,
        },
        include: {
          client: true,
        },
      });

      if (!find) {
        res.status(200).json({
          success: false,
          message: "data tidak ditemukan",
        });
        return;
      }

      result = find;
    } else {
      const find = await model.findMany({
        include: {
          client: true,
        },
      });
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
PaymentGatewayControllers.put(`/payment-client-update/:uid`, async (req, res) => {
  try {
    const { uid } = await req.params;
    const data = await req.body;

    const update = await model.update({
      where: {
        unique_id: uid,
      },
      data: data,
    });

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
PaymentGatewayControllers.delete(`/payment-client-delete/:uid`, async (req, res) => {
  try {
    const { uid } = await req.params;

    const hapus = await model.delete({
      where: {
        unique_id: uid,
      },
    });

    res.status(200).json({
      success: true,
      message: "berhasil hapus",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default PaymentGatewayControllers;
