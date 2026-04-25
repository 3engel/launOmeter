import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import { getDayKey, type DayKey } from "./dates"

export type Role = "student" | "teacher"
export type Mood = 1 | 2 | 3 | 4

export interface Vote {
  id?: number
  role: Role
  mood: Mood
  timestamp: string
  dayKey: DayKey
}

export interface Settings {
  pinHash?: string
  maxStudents: number
  maxTeachers: number
  lockSeconds: number
}

interface LaunometerDB extends DBSchema {
  votes: {
    key: number
    value: Vote
    indexes: {
      by_dayKey: string
      by_role_dayKey: [Role, string]
    }
  }
  settings: {
    key: string
    value: unknown
  }
}

const DB_NAME = "launometer"
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<LaunometerDB>> | null = null

function getDB(): Promise<IDBPDatabase<LaunometerDB>> {
  if (!dbPromise) {
    dbPromise = openDB<LaunometerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("votes")) {
          const store = db.createObjectStore("votes", {
            keyPath: "id",
            autoIncrement: true,
          })
          store.createIndex("by_dayKey", "dayKey")
          store.createIndex("by_role_dayKey", ["role", "dayKey"])
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings")
        }
      },
    })
  }
  return dbPromise
}

export async function addVote(role: Role, mood: Mood): Promise<void> {
  const db = await getDB()
  const now = new Date()
  await db.add("votes", {
    role,
    mood,
    timestamp: now.toISOString(),
    dayKey: getDayKey(now),
  })
}

export async function getVotesByDay(dayKey: DayKey): Promise<Vote[]> {
  const db = await getDB()
  return db.getAllFromIndex("votes", "by_dayKey", dayKey)
}

export async function getVotesInRange(from: Date, to: Date): Promise<Vote[]> {
  const fromKey = getDayKey(from)
  const toKey = getDayKey(to)
  const db = await getDB()
  const range = IDBKeyRange.bound(fromKey, toKey)
  return db.getAllFromIndex("votes", "by_dayKey", range)
}

export async function deleteVotesByDay(dayKey: DayKey): Promise<number> {
  const db = await getDB()
  const tx = db.transaction("votes", "readwrite")
  const index = tx.store.index("by_dayKey")
  let cursor = await index.openCursor(IDBKeyRange.only(dayKey))
  let deleted = 0
  while (cursor) {
    await cursor.delete()
    deleted++
    cursor = await cursor.continue()
  }
  await tx.done
  return deleted
}

export async function deleteAllVotes(): Promise<void> {
  const db = await getDB()
  await db.clear("votes")
}

export async function getDailyCounts(
  dayKey: DayKey
): Promise<{ student: number; teacher: number }> {
  const db = await getDB()
  const student = await db.countFromIndex("votes", "by_role_dayKey", [
    "student",
    dayKey,
  ])
  const teacher = await db.countFromIndex("votes", "by_role_dayKey", [
    "teacher",
    dayKey,
  ])
  return { student, teacher }
}

const SETTING_KEYS = {
  pinHash: "pinHash",
  maxStudents: "maxStudents",
  maxTeachers: "maxTeachers",
  lockSeconds: "lockSeconds",
} as const

export async function getSettings(): Promise<Settings> {
  const db = await getDB()
  const tx = db.transaction("settings")
  const [pinHash, maxStudents, maxTeachers, lockSeconds] = await Promise.all([
    tx.store.get(SETTING_KEYS.pinHash),
    tx.store.get(SETTING_KEYS.maxStudents),
    tx.store.get(SETTING_KEYS.maxTeachers),
    tx.store.get(SETTING_KEYS.lockSeconds),
  ])
  await tx.done
  return {
    pinHash: typeof pinHash === "string" ? pinHash : undefined,
    maxStudents: typeof maxStudents === "number" ? maxStudents : 100,
    maxTeachers: typeof maxTeachers === "number" ? maxTeachers : 20,
    lockSeconds: typeof lockSeconds === "number" ? lockSeconds : 15,
  }
}

export async function setSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K]
): Promise<void> {
  const db = await getDB()
  await db.put("settings", value as unknown, key)
}
