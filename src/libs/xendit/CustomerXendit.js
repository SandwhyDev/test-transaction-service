import md5 from "md5";
import { c } from "./xendit";

export const CreateCustomer = async (
  givenNames,
  email,
  mobileNumber,
  addresses
) => {
  try {
    let customer;
    let uid = await md5(`${givenNames}-${email}-${mobileNumber}`);

    const findCustomer = await c.getCustomerByReferenceID({
      referenceId: uid,
      apiVersion: "2020-05-19",
    });

    if (findCustomer.data.length === 0) {
      customer = await c.createCustomer({
        data: {
          referenceId: uid,
          type: "INDIVIDUAL",
          individualDetail: {
            givenNames: givenNames,
            surname: "Doe",
          },
          email: email,
          mobileNumber: mobileNumber,
        },
      });
    } else {
      return {
        succes: false,
        message: "user sudah terdaftar",
      };
    }

    return {
      succes: true,
      message: customer,
    };
  } catch (e) {
    return {
      succes: false,
      message: e,
    };
  }
};

export const ReadCustomer = async (id) => {
  try {
    console.log(id);
    const customer = await c.getCustomer({
      id: id,
      apiVersion: "2020-10-31",
    });
    return customer;
  } catch (error) {
    return error;
  }
};

export const ReadCustomerByReferenceID = async (reference_id) => {
  try {
    const customers = await c.getCustomerByReferenceID({
      referenceId: reference_id,
      apiVersion: "2020-05-19",
    });

    if (customers.data.length === 0) {
      return {
        status: false,
      };
    }

    return {
      status: true,
      message: customers,
    };
  } catch (error) {
    return {
      status: false,
    };
  }
};

export const UpdateCustomer = async (id, data) => {
  try {
    const cekUser = await ReadCustomerByReferenceID(id);

    if (!cekUser.status) {
      return {
        status: false,
        message: "data tidak ditemukan",
      };
    }

    const customers = await c.updateCustomer({
      id: cekUser.message.data[0].id,
      data: data,
    });

    return {
      status: true,
      message: customers,
    };
  } catch (error) {
    return {
      status: false,
      message: error,
    };
  }
};
