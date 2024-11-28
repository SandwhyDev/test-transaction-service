const md5 = require("md5");
const { default: ClientModel } = require("./src/models/ClientModel");
const { GenerateDate } = require("./src/libs/HandleGenerate");

class Alien {
  constructor(name, phrase) {
    this.name = name;
    this.phrase = phrase;
    this.sound = "zyingggggggg";
  }

  Metode1() {
    return this.name;
  }

  Metode2 = () => this.phrase;
}

class Martian extends Alien {
  constructor(name, phrase, color) {
    super(name, phrase); // Memanggil konstruktor kelas induk
    this.color = color; // Properti tambahan untuk kelas keturunan
  }

  // Menambahkan metode baru khusus Martian
  #describe(name) {
    return `I am ${name}, a ${this.color} Martian, and I say "${this.phrase}".`;
  }

  metode4(name) {
    return this.#describe(name, this.color);
  }

  // Override metode dari kelas induk
  Metode3 = () => this.phrase.toUpperCase();
}

class Client {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  async CreateClient() {
    const date = await GenerateDate();
    const id = await md5(`${this.name}-${date}`);

    const create = await ClientModel.create({
      data: {
        unique_id: id,
        name: this.name,
        created_at: date,
        updated_at: date,
      },
    });

    return create;
  }

  async FindClient(id) {
    let find;

    if (id) {
      find = await ClientModel.findUnique({
        where: {
          unique_id: id,
        },
        include: {
          invoice: true,
          payment_gateway: true,
        },
      });

      if (!find) {
        return "data tidak ada";
      }
    } else {
      find = ClientModel.findMany({
        include: {
          invoice: true,
          payment_gateway: true,
        },
      });
    }

    return find;
  }

  async UpdateClient(id, data) {
    const find = await this.FindClient(id);
    const date = await GenerateDate();

    if (!find) {
      return false;
    }

    const update = await ClientModel.update({
      where: {
        unique_id: find.unique_id,
      },
      data: {
        ...data,
        updated_at: date,
      },
    });

    return update;
  }
}
module.exports = { Alien, Client, Martian };
