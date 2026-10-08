import postgres from "postgres";
let client: ReturnType<typeof postgres> | undefined;
export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no configurada");
  return (client ??= postgres(url, { max: 5, prepare: false, ssl: "require" }));
}
export async function query<T extends Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) {
  return (await Reflect.apply(db(), null, [strings, ...values])) as T[];
}
export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}
