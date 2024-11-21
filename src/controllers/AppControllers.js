import express from "express";
import md5 from "md5";
import AppModel from "../models/AppModel";

const AppControllers = express.Router();

const model = AppModel;

// create
AppControllers.post(`/app-create`, async (req, res) => {
  try {
    const data = await req.body;

    const cekName = await model.findFirst({
      where: {
        name: data.name,
      },
    });

    if (cekName) {
      return res.status(403).json({
        success: false,
        message: "app sudah terdaftar",
      });
    }

    const unique_id = await md5(`${data.name}-${data.client_id}`);

    const create = await model.create({
      data: {
        unique_id: unique_id,
        name: data.name,
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
AppControllers.get(`/app-read/:id?`, async (req, res) => {
  try {
    const { id } = await req.params;
    var result;

    if (id) {
      const find = await model.findUnique({
        where: {
          unique_id: id,
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
AppControllers.put(`/app-update/:id`, async (req, res) => {
  try {
    const { id } = await req.params;
    const data = await req.body;

    const find = await model.findUnique({
      where: {
        unique_id: id,
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
        id: id,
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
AppControllers.delete(`/app-delete/:id`, async (req, res) => {
  try {
    const { id } = await req.params;

    const find = await model.findUnique({
      where: {
        unique_id: id,
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

export default AppControllers;
