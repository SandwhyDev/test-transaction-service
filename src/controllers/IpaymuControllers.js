import express from "express";
import { ReadPaymentIpaymu } from "../libs/ipaymu/VaPaymentIpaymu";

const IpaymuControllers = express.Router();

const model = "models_prisma";

// create
IpaymuControllers.post(`/ipaymu-create`, async (req, res) => {
  try {
    const data = await req.body;

    const create = await model.create({
      data: data,
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
IpaymuControllers.get(`/ipaymu-read/:uid?`, async (req, res) => {
  try {
    const { uid } = await req.params;
    var result;
    const find = await ReadPaymentIpaymu(uid);

    if (!String(find.status).startsWith("2")) {
      return res.status(find.status).json({
        success: false,
        message: find.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "berhasil",
      data: find.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// update
IpaymuControllers.put(`/ipaymu-update`, async (req, res) => {
  try {
    const data = await req.body;

    const update = await model.update({
      where: {
        id: +data.id,
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
IpaymuControllers.delete(`/ipaymu-delete/:id`, async (req, res) => {
  try {
    const { id } = await req.params;

    const hapus = await model.delete({
      where: {
        id: +id,
      },
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

export default IpaymuControllers;
