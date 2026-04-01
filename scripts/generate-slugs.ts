import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const PL_MAP: Record<string, string> = {
  ą: "a", ć: "c", ę: "e", ł: "l", ń: "n",
  ó: "o", ś: "s", ź: "z", ż: "z",
};

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => PL_MAP[c] ?? c)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueListSlug(base: string, excludeId: string): Promise<string> {
  let slug = toSlug(base) || "lista";
  const taken = await prisma.shoppingList.findUnique({ where: { slug } });
  if (!taken || taken.id === excludeId) return slug;
  let i = 2;
  while (true) {
    const candidate = `${slug}-${i}`;
    const t = await prisma.shoppingList.findUnique({ where: { slug: candidate } });
    if (!t || t.id === excludeId) return candidate;
    i++;
  }
}

async function uniqueProjectSlug(base: string, excludeId: string): Promise<string> {
  let slug = toSlug(base) || "projekt";
  const taken = await prisma.project.findUnique({ where: { slug } });
  if (!taken || taken.id === excludeId) return slug;
  let i = 2;
  while (true) {
    const candidate = `${slug}-${i}`;
    const t = await prisma.project.findUnique({ where: { slug: candidate } });
    if (!t || t.id === excludeId) return candidate;
    i++;
  }
}

async function main() {
  // Generate slugs for ShoppingLists without one
  const lists = await prisma.shoppingList.findMany({ where: { slug: null } });
  console.log(`Lists without slug: ${lists.length}`);
  for (const list of lists) {
    const slug = await uniqueListSlug(list.name, list.id);
    await prisma.shoppingList.update({ where: { id: list.id }, data: { slug } });
    console.log(`  List "${list.name}" → /listy/${slug}`);
  }

  // Generate slugs for Projects without one
  const projects = await prisma.project.findMany({ where: { slug: null } });
  console.log(`Projects without slug: ${projects.length}`);
  for (const project of projects) {
    const slug = await uniqueProjectSlug(project.title, project.id);
    await prisma.project.update({ where: { id: project.id }, data: { slug } });
    console.log(`  Project "${project.title}" → /projekty/${slug}`);
  }

  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
