/**
 * Export the resource-center guide catalog for the admin panel.
 *
 * The written guides ship inside this app's bundle, so the backend has no way
 * to know which guides exist or what their steps are called — and without that
 * the admin's "attach a video" screen would be a box you type a slug into and
 * hope. This writes the slugs, titles and step titles the app actually ships
 * into the backend repo as a committed JSON file.
 *
 *   npm run export:guide-catalog
 *
 * Run it whenever you add, rename, or re-order a guide or its steps, and commit
 * the result in the backend repo. Nothing breaks if you forget: the admin can
 * still enter a slug by hand, and a slug either side does not recognise simply
 * renders no video.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { RESOURCE_GUIDES } from "../constants/resourceGuides";

const DEFAULT_OUTPUT = "../ODOS_MOBILE_BACKEND/app/data/guide_catalog.json";

function main() {
  const target = resolve(
    process.cwd(),
    process.argv[2] ?? process.env.GUIDE_CATALOG_OUTPUT ?? DEFAULT_OUTPUT,
  );

  const catalog = {
    generated_by: "odos-mobile-expo/scripts/export-guide-catalog.ts",
    guide_count: RESOURCE_GUIDES.length,
    guides: RESOURCE_GUIDES.map((guide) => ({
      slug: guide.slug,
      title: guide.title,
      category: guide.category,
      summary: guide.summary,
      minutes: guide.minutes,
      starter_order: guide.starterOrder ?? null,
      steps: guide.steps.map((step, index) => ({
        index,
        title: step.title,
      })),
    })),
  };

  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  const stepCount = catalog.guides.reduce((total, guide) => total + guide.steps.length, 0);
  console.log(
    `Wrote ${catalog.guide_count} guides (${stepCount} steps) to ${target}`,
  );
}

main();
