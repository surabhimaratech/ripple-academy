import { legacyState } from "../domain/legacyFixture";
import "fake-indexeddb/auto";
import { it, expect } from "vitest";
import { Repository } from "./repository";
it("persists completions, edits and redemption history across repository restarts", async () => {
  const name = crypto.randomUUID();
  let r = new Repository(name);
  await r.restore(legacyState());
  await r.transact({ type: "complete", id: "reading" });
  await r.transact({ type: "complete", id: "create" });
  await r.transact({ type: "redeem", id: "coffee", redemptionId: "a" });
  await r.close();
  r = new Repository(name);
  const s = await r.transact();
  expect([s.xp, s.gold]).toEqual([90, 5]);
  expect(s.history).toHaveLength(1);
  expect(s.quests[0].completed).toBeTruthy();
  await r.transact({ type: "undo", id: "reading" });
  await r.close();
  r = new Repository(name);
  expect((await r.transact()).gold).toBe(-10);
  await r.close();
});
it("serializes concurrent completion attempts from separate connections", async () => {
  const name = crypto.randomUUID();
  const a = new Repository(name),
    b = new Repository(name);
  await a.restore(legacyState());
  await Promise.all([
    a.transact({ type: "complete", id: "reading" }),
    b.transact({ type: "complete", id: "reading" }),
  ]);
  expect((await a.transact()).xp).toBe(40);
  await a.close();
  await b.close();
});
it("rolls back failed purchases", async () => {
  const r = new Repository(crypto.randomUUID());
  await r.restore(legacyState());
  await expect(
    r.transact({ type: "redeem", id: "book", redemptionId: "x" }),
  ).rejects.toThrow();
  expect((await r.transact()).history).toEqual([]);
  await r.close();
});

it("loads a legacy database intact, imports atomically, and recovers the previous save after reopen", async () => {
  const name = crypto.randomUUID();
  let r = new Repository(name);
  await r.restore(legacyState());
  const old = await r.transact({ type: "complete", id: "reading" });
  const incoming = {
    version: 1 as const,
    xp: 300,
    gold: 50,
    quests: [],
    rewards: [],
    history: [],
  };
  await r.restore(incoming);
  await r.close();
  r = new Repository(name);
  expect(await r.transact()).toEqual(incoming);
  expect(await r.recover()).toEqual(old);
  expect((await r.transact()).quests[0].completed?.xp).toBe(40);
  expect(await r.recover()).toEqual(incoming);
  await r.close();
});
it("invalid imports do not touch the current save or its recovery copy", async () => {
  const r = new Repository(crypto.randomUUID());
  await r.restore(legacyState());
  const old = await r.transact({ type: "complete", id: "reading" });
  const next = { ...old, xp: 100 };
  await r.restore(next);
  await expect(r.restore({ ...old, xp: -1 })).rejects.toThrow();
  expect(await r.transact()).toEqual(next);
  expect(await r.recover()).toEqual(old);
  await r.close();
});
it("serializes import with completion and redemption without partial records", async () => {
  const name = crypto.randomUUID();
  const a = new Repository(name),
    b = new Repository(name);
  await a.restore(legacyState());
  const original = await a.transact({ type: "complete", id: "reading" });
  await a.restore({ ...original, gold: 100 });
  await Promise.all([
    a.transact({ type: "redeem", id: "coffee", redemptionId: "same" }),
    b.transact({ type: "redeem", id: "coffee", redemptionId: "same" }),
  ]);
  const result = await a.transact();
  expect(result.gold).toBe(70);
  expect(result.history).toHaveLength(1);
  await a.close();
  await b.close();
});

it("opens a pre-milestone database without a migration, reset or optional-field rewrite", async () => {
  const name = crypto.randomUUID();
  const legacy = {
    version: 1 as const,
    xp: 123,
    gold: 17,
    quests: [],
    rewards: [],
    history: [],
  };
  await new Promise<void>((resolve, reject) => {
    const open = indexedDB.open(name, 1);
    open.onupgradeneeded = () => open.result.createObjectStore("save");
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction("save", "readwrite");
      tx.objectStore("save").put(legacy, "player");
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    };
  });
  const r = new Repository(name);
  expect(await r.transact()).toEqual(legacy);
  await r.close();
});
it("a concurrent import and completion serialize as complete saves", async () => {
  const name = crypto.randomUUID();
  const a = new Repository(name),
    b = new Repository(name);
  await a.restore(legacyState());
  const legacy = await a.transact();
  const incoming = { ...legacy, xp: 100, gold: 50 };
  await Promise.all([
    a.restore(incoming),
    b.transact({ type: "complete", id: "reading" }),
  ]);
  const result = await a.transact();
  expect([
    [100, 50],
    [140, 65],
  ]).toContainEqual([result.xp, result.gold]);
  expect(!!result.quests[0].completed).toBe(result.xp === 140);
  const recovery = await a.recover();
  expect([
    [0, 0],
    [40, 15],
  ]).toContainEqual([recovery.xp, recovery.gold]);
  await a.close();
  await b.close();
});

it("persists sessions and max-merges checkpoints from separate connections", async () => {
  const name = crypto.randomUUID(),
    a = new Repository(name),
    b = new Repository(name);
  await a.restore(legacyState());
  await a.transact({
    type: "startSession",
    id: "focus",
    runId: "run",
    categoryId: "coding",
    questId: "reading",
  });
  await Promise.all([
    a.transact({
      type: "checkpointSession",
      id: "focus",
      runId: "run",
      elapsedMs: 10000,
    }),
    b.transact({
      type: "checkpointSession",
      id: "focus",
      runId: "run",
      elapsedMs: 10000,
    }),
  ]);
  expect((await a.transact()).sessions?.[0].elapsedMs).toBe(10000);
  const finish = {
    type: "finishSession" as const,
    id: "focus",
    runId: "run",
    elapsedMs: 15000,
    notes: "Done.",
    completeQuest: true,
  };
  await Promise.all([a.transact(finish), b.transact(finish)]);
  await a.close();
  await b.close();
  const reopened = new Repository(name);
  const saved = await reopened.transact();
  expect([saved.xp, saved.gold]).toEqual([40, 15]);
  expect(saved.sessions?.[0]).toMatchObject({
    phase: "finished",
    elapsedMs: 15000,
    notes: "Done.",
  });
  await reopened.close();
});
it("rolls back both session completion and quest awards if completion data is invalid", async () => {
  const r = new Repository(crypto.randomUUID());
  await r.restore(legacyState());
  await r.transact({
    type: "startSession",
    id: "s",
    runId: "r",
    categoryId: "reading",
    questId: "reading",
  });
  await expect(
    r.transact({
      type: "finishSession",
      id: "s",
      runId: "r",
      elapsedMs: 5000,
      completeQuest: true,
      notes: "x".repeat(10001),
    }),
  ).rejects.toThrow();
  const state = await r.transact();
  expect(state.sessions?.[0].phase).toBe("running");
  expect([state.xp, state.gold]).toEqual([0, 0]);
  await r.close();
});
