import { apply, initialState, type Action, type State } from "../domain/model";
import { validateSave } from "../domain/save";
type Operation =
  | { kind: "action"; action?: Action }
  | { kind: "import"; state: State }
  | { kind: "recover" };
export class Repository {
  private db: Promise<IDBDatabase>;
  constructor(name = "magical-university") {
    this.db = new Promise((resolve, reject) => {
      const r = indexedDB.open(name, 1);
      r.onupgradeneeded = () => r.result.createObjectStore("save");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }
  transact(action?: Action): Promise<State> {
    return this.commit({ kind: "action", action });
  }
  restore(input: unknown): Promise<State> {
    try {
      return this.commit({ kind: "import", state: validateSave(input) });
    } catch (e) {
      return Promise.reject(e);
    }
  }
  recover(): Promise<State> {
    return this.commit({ kind: "recover" });
  }
  private async commit(operation: Operation): Promise<State> {
    const db = await this.db;
    return new Promise((resolve, reject) => {
      const tx = db.transaction("save", "readwrite");
      const store = tx.objectStore("save");
      let result: State;
      let failure: unknown;
      const abort = (e: unknown) => {
        failure = e;
        tx.abort();
      };
      const get = store.get("player");
      get.onsuccess = () => {
        try {
          const current = (get.result as State | undefined) ?? initialState();
          if (current.version !== 1)
            throw Error("This save version is not supported.");
          if (operation.kind === "recover") {
            const backup = store.get("before-import");
            backup.onsuccess = () => {
              try {
                if (!backup.result)
                  throw Error("No pre-import save is available yet.");
                result = validateSave(backup.result);
                store.put(current, "before-import");
                store.put(result, "player");
              } catch (e) {
                abort(e);
              }
            };
            return;
          }
          if (operation.kind === "import") {
            store.put(current, "before-import");
            result = operation.state;
          } else
            result = operation.action
              ? apply(current, operation.action)
              : current;
          store.put(result, "player");
        } catch (e) {
          abort(e);
        }
      };
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(failure ?? tx.error);
      tx.onabort = () =>
        reject(failure ?? tx.error ?? Error("Could not save progress."));
    });
  }
  async close() {
    (await this.db).close();
  }
}
