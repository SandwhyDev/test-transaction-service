import express from "express";
import {
  CreateCustomer,
  ReadCustomer,
  ReadCustomerByReferenceID,
  UpdateCustomer,
} from "../../libs/xendit/CustomerXendit";

const CustomersXenditControllers = express.Router();

// CREATE CUSTOMER
CustomersXenditControllers.post("/create_customer", async (req, res) => {
  try {
    const data = await req.body;

    const createCustomer = await CreateCustomer(
      data.givenNames,
      data.email,
      data.mobileNumber,
      data.description,
      data.middleName,
      data.surname,
      data.addresses
    );

    // HANDLE ERROR
    if (!createCustomer.succes) {
      res.status(403).json({
        status: false,
        message: createCustomer.message,
      });
      return false;
    }

    res.status(200).json({
      status: true,
      message: "berhasil",
      //   invoice: createCustomer,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

// READ CUSTOMER
CustomersXenditControllers.get("/read_customer", async (req, res) => {
  try {
    const { id } = await req.query;

    const readCustomer = await ReadCustomer(id);

    if (
      Number.isInteger(readCustomer.status) &&
      !readCustomer.status.toString().startsWith("20")
    ) {
      res.status(readCustomer.status).json({
        status: false,
        message: readCustomer,
      });
      return false;
    }

    res.status(200).json({
      status: true,
      message: "berhasil",
      total_data: readCustomer.length,
      invoice: readCustomer,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

// READ CUSTOMER BY REFERENSI
CustomersXenditControllers.get("/read_customer_ref_id", async (req, res) => {
  try {
    const { id } = await req.query;

    const readCustomer = await ReadCustomerByReferenceID(id);

    if (
      Number.isInteger(readCustomer.status) &&
      !readCustomer.status.toString().startsWith("20")
    ) {
      res.status(readCustomer.status).json({
        status: false,
        message: readCustomer,
      });
      return false;
    }

    res.status(200).json({
      status: true,
      message: "berhasil",
      invoice: readCustomer,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

// UPDATE CUSTOMER
CustomersXenditControllers.put("/update_customer/:id", async (req, res) => {
  try {
    const data = await req.body;
    const { id } = await req.params;
    const updateCustomer = await UpdateCustomer(id, data);

    if (!updateCustomer.status) {
      res.status(403).json({
        status: false,
        message: updateCustomer.message,
      });
      return false;
    }

    res.status(200).json({
      status: true,
      message: "berhasil",
      data: updateCustomer.message,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

export default CustomersXenditControllers;
