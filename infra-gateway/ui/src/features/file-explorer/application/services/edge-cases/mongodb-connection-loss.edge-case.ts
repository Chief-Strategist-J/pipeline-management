export class MongodbConnectionLossEdgeCase {
  public static async executeSafely<T>(asyncFn: () => Promise<T>, fallbackValue?: T): Promise<T | undefined> {
    try {
      return await asyncFn();
    } catch {
      return fallbackValue;
    }
  }
}
