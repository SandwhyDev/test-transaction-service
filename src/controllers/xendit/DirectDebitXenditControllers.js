import express from "express";
import { CreateDirectDebitXendit } from "../../libs/xendit/HandleDebitCreditXendit";

const DirectDebitXenditControllers = express.Router();

const model = "models_prisma;";

// create
DirectDebitXenditControllers.post(`/direct-debit-create`, async (req, res) => {
  try {
    const data = await req.body;

    const create = await CreateDirectDebitXendit();

    if (!create.success) {
      res.status(500).json({
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
DirectDebitXenditControllers.get(
  `/direct-debit-read/:uid?`,
  async (req, res) => {
    try {
      const { uid } = await req.params;
      var result;

      if (uid) {
        const find = await model.findUnique({
          where: {
            unique_id: uid,
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
        const find = await model.findMany();
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
  }
);
// update
DirectDebitXenditControllers.put(`/direct-debit-update`, async (req, res) => {
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
DirectDebitXenditControllers.delete(
  `/direct-debit-delete/:id`,
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

export default DirectDebitXenditControllers;
