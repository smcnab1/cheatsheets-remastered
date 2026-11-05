const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { createRequire } = require("node:module");
const { test } = require("node:test");

test("tooling bounds repeated globstar parent segments", () => {
  const fromOclif = createRequire(require.resolve("@oclif/core"));
  const result = spawnSync(
    process.execPath,
    [
      "-e",
      `const { Minimatch } = require(${JSON.stringify(fromOclif.resolve("minimatch"))});
       const matcher = new Minimatch("a/" + "**/../p/q/".repeat(18) + "x", { optimizationLevel: 2 });
       const capped = new Minimatch("b/" + "**/../a/b/".repeat(18) + "y", { optimizationLevel: 2, braceExpandMax: 32 });
       console.log(JSON.stringify([matcher.globParts.length, capped.globParts.length]));`,
    ],
    { encoding: "utf8", timeout: 3000 },
  );
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  const [defaultCount, cappedCount] = JSON.parse(result.stdout);
  assert.ok(defaultCount > 0 && defaultCount <= 100_000, result.stdout);
  assert.ok(cappedCount > 0 && cappedCount <= 32, result.stdout);
});

test("CLI and lint glob matching and legacy filelist selection remain compatible", () => {
  for (const consumer of ["@oclif/core", "@eslint/config-array", "eslint"]) {
    const fromConsumer = createRequire(require.resolve(consumer));
    const { minimatch, Minimatch } = fromConsumer("minimatch");
    assert.equal(minimatch("src/lib/model.ts", "src/**/*.ts"), true);
    assert.equal(minimatch("src/lib/model.js", "src/**/*.ts"), false);
    assert.equal(new Minimatch("**/*.{ts,tsx}").match("src/view.tsx"), true);
    assert.equal(new Minimatch("**/*.ts", { dot: true }).match(".hidden/a.ts"), true);
  }
  const { FileList } = require("filelist");
  const files = new FileList("src/**/*.ts", "src/**/*.tsx").exclude("src/**/*.tsx").toArray();
  assert.ok(files.includes("src/repository-sync.ts"));
  assert.ok(files.every((file) => file.endsWith(".ts")));
});
