export class StringUtil {
  public static escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  public static getAllStringBetween(start, end, data): string[] {
    const d = [];
    let sIndex = 0;
    let eIndex = 0;
    while (true) {
      sIndex = data.indexOf(start, eIndex);
      if (sIndex === -1) {
        break;
      }
      sIndex = sIndex + start.length;
      eIndex = data.indexOf(end, sIndex);
      if (eIndex === -1) {
        break;
      }
      d.push(start + data.substring(sIndex, eIndex) + end);
    }
    return d;
  }
}
