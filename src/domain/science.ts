import type { ActivityCategory, ActivitySession } from "./sessions";
export const scienceKinds = [
  "stargazing",
  "astronomy-learning",
  "data-analysis",
  "scientific-programming",
  "experiment",
  "observation",
] as const;
export type ScienceKind = (typeof scienceKinds)[number];
export const scienceLabels: Record<ScienceKind, string> = {
  stargazing: "Stargazing",
  "astronomy-learning": "Astronomy and astrophysics learning",
  "data-analysis": "Astronomical data analysis",
  "scientific-programming": "Scientific programming",
  experiment: "Scientific experiments",
  observation: "Observation and reflection",
};
export const scienceCategories: ActivityCategory[] = scienceKinds.map(
  (kind) => ({
    id: `science-${kind}`,
    title: scienceLabels[kind],
    room: "observatory",
  }),
);
export function scienceIntent(value: string): ScienceKind {
  const exact = value.replace(/^science-/, "") as ScienceKind;
  if (scienceKinds.includes(exact)) return exact;
  const s = value.toLowerCase();
  if (/stargaz|telescope|observe the moon/.test(s)) return "stargazing";
  if (/python|program|coding|lightkurve/.test(s))
    return "scientific-programming";
  if (/data|analysis|light curve|periodogram/.test(s)) return "data-analysis";
  if (/journal|reflection|research notes/.test(s)) return "observation";
  if (/experiment|simulation/.test(s)) return "experiment";
  return "astronomy-learning";
}
export function scienceActivity(kind: ScienceKind) {
  return kind === "stargazing"
    ? "telescope"
    : kind === "observation"
      ? "charts"
      : kind === "astronomy-learning"
        ? "celestial-charts"
        : "observatory-code";
}
export interface Observation {
  observedAt: string;
  category: ScienceKind;
  objective?: string;
  experiment?: string;
  results?: string;
  sourceUrl?: string;
  localReference?: string;
  nextSteps?: string;
  questId?: string;
  sessionId?: string;
  courseId?: string;
}
export function boundedText(v: unknown, name: string, max = 120) {
  if (typeof v !== "string" || v.length > max) throw Error(`Invalid ${name}.`);
  return v;
}
export function observationDetails(input: unknown): Observation {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw Error("Invalid observation.");
  const v = input as Record<string, unknown>;
  const observedAt = boundedText(v.observedAt, "observation date", 64);
  if (
    !Number.isFinite(Date.parse(observedAt)) ||
    !scienceKinds.includes(v.category as ScienceKind)
  )
    throw Error("Invalid observation date or category.");
  const r: Observation = { observedAt, category: v.category as ScienceKind };
  for (const key of [
    "objective",
    "experiment",
    "results",
    "sourceUrl",
    "localReference",
    "nextSteps",
    "questId",
    "sessionId",
    "courseId",
  ] as const) {
    if (v[key] !== undefined)
      r[key] = boundedText(
        v[key],
        key,
        ["results", "nextSteps"].includes(key)
          ? 4000
          : key === "sourceUrl" || key === "localReference"
            ? 2048
            : key.endsWith("Id")
              ? 128
              : 240,
      );
  }
  if (r.sourceUrl) {
    let url: URL;
    try {
      url = new URL(r.sourceUrl);
    } catch {
      throw Error("Use a complete http or https source URL.");
    }
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw Error("Use a plain http or https source URL.");
  }
  return r;
}
/** Optional text metadata; never inspects a local file or a real scientific process. */
export function sessionDetails(
  v: Record<string, unknown>,
): Pick<ActivitySession, "objective" | "experiment"> {
  const r: Pick<ActivitySession, "objective" | "experiment"> = {};
  for (const key of ["objective", "experiment"] as const)
    if (v[key] !== undefined) r[key] = boundedText(v[key], key, 240);
  return r;
}
