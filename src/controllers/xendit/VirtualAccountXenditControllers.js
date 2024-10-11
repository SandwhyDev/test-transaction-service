import express from "express";
import {
  CreateVA,
  ReadAllVa,
  ReadVa,
  ReadVaById,
  SimulateVa,
} from "../../libs/xendit/VirtualAccountXendit";

const VirtualAccountXenditControllers = express.Router();

// create
VirtualAccountXenditControllers.post(`/va-create`, async (req, res) => {
  try {
    const data = await req.body;

    const create = await CreateVA();

    if (!create.status) {
      res.status(403).json({
        success: false,
        message: create.message,
      });
    }

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

// simulate
VirtualAccountXenditControllers.post(`/va-simulate/:id`, async (req, res) => {
  try {
    const { id } = await req.params;
    const data = await req.body;

    const create = await SimulateVa(id, data.amount);

    if (!create.status) {
      res.status(403).json({
        success: false,
        message: create.message,
      });
      return;
    }

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
VirtualAccountXenditControllers.get(`/va-read/:uid?`, async (req, res) => {
  try {
    const { uid } = await req.params;
    var result;

    if (uid) {
      result = await ReadVaById(uid);

      if (!result.status) {
        res.status(200).json({
          success: false,
          message: result.message,
        });
        return;
      }
    } else {
      result = await ReadAllVa();
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
VirtualAccountXenditControllers.put(`/ApiFor-update`, async (req, res) => {
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
VirtualAccountXenditControllers.delete(
  `/ApiFor-delete/:id`,
  async (req, res) => {
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
  }
);

export default VirtualAccountXenditControllers;
