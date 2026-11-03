import { parse } from "yaml";
import cvYaml from "../data/cv.yaml?raw";
import { z } from "zod";

/**
 * The CV schema. Deliberately strict: a missing field or a malformed date fails
 * the build rather than shipping a broken CV. If this throws, fix the YAML.
 */

const Link = z.object({
  label: z.string().min(1),
  href: z.string().url(),
});

const Fact = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

const Entry = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  start: z.string().min(1),
  end: z.string().min(1),
  location: z.string().optional(),
  note: z.string().optional(),
  summary: z.string().optional(),
  bullets: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

const CvSchema = z.object({
  person: z.object({
    name: z.string().min(1),
    displayName: z.string().min(1),
    legalName: z.string().min(1).optional(),
    headline: z.string().min(1),
    positioning: z.string().min(1),
    location: z.string().min(1),
    email: z.string().email(),
    links: z.array(Link).min(1),
    summary: z.array(z.string().min(1)).min(1),
  }),
  facts: z.array(Fact).length(4),
  experience: z.array(Entry).min(1),
  earlier: z.array(
    z.object({ org: z.string().min(1), role: z.string().min(1), period: z.string().min(1) }),
  ),
  education: z.array(Entry).min(1),
  publications: z.array(
    z.object({ title: z.string().min(1), venue: z.string().min(1), status: z.string().min(1) }),
  ),
  skills: z.array(z.object({ group: z.string().min(1), items: z.array(z.string()).min(1) })),
  languages: z.array(z.object({ name: z.string().min(1), level: z.string().min(1) })),
});

export type Cv = z.infer<typeof CvSchema>;
export type CvEntry = z.infer<typeof Entry>;

const result = CvSchema.safeParse(parse(cvYaml));

if (!result.success) {
  const lines = result.error.issues.map(
    (issue) => `  ${issue.path.join(".") || "(root)"}: ${issue.message}`,
  );
  throw new Error(`Invalid src/data/cv.yaml\n${lines.join("\n")}`);
}

export const cv: Cv = result.data;
