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

module.exports = { Alien, Martian };
