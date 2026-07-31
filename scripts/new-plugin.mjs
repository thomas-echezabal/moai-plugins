#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [slug, displayName, description] = process.argv.slice(2);
const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

if (!slug || !displayName || !description) {
  throw new Error(
    'Usage: node scripts/new-plugin.mjs <slug> "Display name" "Description"',
  );
}
if (!kebabCase.test(slug)) throw new Error("Plugin slug must be kebab-case.");

const pluginRoot = join(repoRoot, "plugins", slug);
if (existsSync(pluginRoot)) throw new Error(`Plugin "${slug}" already exists.`);
const shortDescription =
  description.length <= 64
    ? description
    : `${description.slice(0, 61).trimEnd()}...`;

const marketplacePath = join(repoRoot, ".claude-plugin", "marketplace.json");
const marketplace = JSON.parse(readFileSync(marketplacePath, "utf8"));
const codexMarketplacePath = join(
  repoRoot,
  ".agents",
  "plugins",
  "marketplace.json",
);
const codexMarketplace = JSON.parse(readFileSync(codexMarketplacePath, "utf8"));
if (marketplace.plugins.some((plugin) => plugin.name === slug)) {
  throw new Error(`Marketplace already contains "${slug}".`);
}
if (codexMarketplace.plugins.some((plugin) => plugin.name === slug)) {
  throw new Error(`Codex marketplace already contains "${slug}".`);
}

mkdirSync(join(pluginRoot, ".claude-plugin"), { recursive: true });
mkdirSync(join(pluginRoot, ".codex-plugin"), { recursive: true });
mkdirSync(join(pluginRoot, "skills", slug), { recursive: true });
mkdirSync(join(pluginRoot, "skills", slug, "agents"), { recursive: true });

writeFileSync(
  join(pluginRoot, ".claude-plugin", "plugin.json"),
  `${JSON.stringify(
    {
      name: slug,
      displayName,
      version: "1.0.0",
      description,
      author: { name: "Mother of AI" },
    },
    null,
    2,
  )}\n`,
);
writeFileSync(
  join(pluginRoot, ".codex-plugin", "plugin.json"),
  `${JSON.stringify(
    {
      name: slug,
      version: "1.0.0",
      description,
      author: {
        name: "Mother of AI",
        url: "https://themotherofai.com",
      },
      homepage: "https://themotherofai.com",
      repository: "https://github.com/thomas-echezabal/moai-plugins",
      skills: "./skills/",
      interface: {
        displayName,
        shortDescription,
        longDescription: description,
        developerName: "Mother of AI",
        category: "Productivity",
        capabilities: ["Interactive"],
        websiteURL: "https://themotherofai.com",
        defaultPrompt: [`Help me use ${displayName}.`],
      },
    },
    null,
    2,
  )}\n`,
);
writeFileSync(
  join(pluginRoot, "README.md"),
  `# ${displayName}\n\n${description}\n`,
);
writeFileSync(
  join(pluginRoot, "CHANGELOG.md"),
  `# Changelog\n\n## 1.0.0\n\nInitial release.\n`,
);
writeFileSync(
  join(pluginRoot, "skills", slug, "SKILL.md"),
  `---\nname: ${slug}\ndescription: ${description}\n---\n\n# ${displayName}\n\nReplace this scaffold with the plugin workflow.\n`,
);
writeFileSync(
  join(pluginRoot, "skills", slug, "agents", "openai.yaml"),
  `interface:\n  display_name: ${JSON.stringify(displayName)}\n  short_description: ${JSON.stringify(shortDescription)}\n  default_prompt: ${JSON.stringify(`Use $${slug} to help me with ${displayName}.`)}\n`,
);

marketplace.plugins.push({
  name: slug,
  displayName,
  source: `./plugins/${slug}`,
  description,
  category: "productivity",
  tags: [],
});
marketplace.plugins.sort((left, right) => left.name.localeCompare(right.name));
writeFileSync(marketplacePath, `${JSON.stringify(marketplace, null, 2)}\n`);

codexMarketplace.plugins.push({
  name: slug,
  source: {
    source: "local",
    path: `./plugins/${slug}`,
  },
  policy: {
    installation: "AVAILABLE",
    authentication: "ON_INSTALL",
  },
  category: "Productivity",
});
codexMarketplace.plugins.sort((left, right) =>
  left.name.localeCompare(right.name),
);
writeFileSync(
  codexMarketplacePath,
  `${JSON.stringify(codexMarketplace, null, 2)}\n`,
);

process.stdout.write(
  `Created dual Claude + ChatGPT/Codex plugin plugins/${slug} and added it to both marketplace catalogs.\n`,
);
