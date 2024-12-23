class IdGenerator {
  private static readonly characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  static generateId(length: number = 5): string {
    let result = "";
    const charactersLength = this.characters.length;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      result += this.characters[randomIndex];
    }

    return result;
  }
}

export default IdGenerator;
