import express from "express";
import { GenerateDate } from "../libs/HandleGenerate";
import md5 from "md5";
import HandleBigInt from "../libs/HandleBigInt";
import ClientModel from "../models/ClientModel";

const ClientControllers = express.Router();

const model = ClientModel;

// create
ClientControllers.post(`/client-create`, async (req, res) => {
  try {
    const data = await req.body;
    const date = await GenerateDate();
    const uid = await md5(`${data.name}-${date}`);

    const create = await model.create({
      data: {
        unique_id: uid,
        name: data.name,
        created_at: date,
        updated_at: date,
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
ClientControllers.get(`/client-read/:uid?`, async (req, res) => {
  try {
    const { uid } = await req.params;
    var result;

    if (uid) {
      const find = await model.findUnique({
        where: {
          unique_id: uid,
        },
        include: {
          app: true,
          payment_gateway: true,
          invoice: true,
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
          app: true,
          invoice: true,
          payment_gateway: true,
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

// update
ClientControllers.put(`/client-update/:uid`, async (req, res) => {
  try {
    const { uid } = await req.params;
    const data = await req.body;
    const date = await GenerateDate();

    const find = await model.findUnique({
      where: {
        unique_id: uid,
      },
      include: {
        app: true,
        invoice: true,
      },
    });

    if (!find) {
      res.status(200).json({
        success: false,
        message: "data tidak ditemukan",
      });
      return;
    }

    const update = await model.update({
      where: {
        unique_id: uid,
      },
      data: {
        ...data,
        updated_at: date,
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

// delete
ClientControllers.delete(`/client-delete/:id`, async (req, res) => {
  try {
    const { id } = await req.params;

    const find = await model.findUnique({
      where: {
        unique_id: uid,
      },
      include: {
        app: true,
        invoice: true,
      },
    });

    if (!find) {
      res.status(200).json({
        success: false,
        message: "data tidak ditemukan",
      });
      return;
    }

    const hapus = await model.delete({
      where: {
        unique_id: id,
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

export default ClientControllers;
