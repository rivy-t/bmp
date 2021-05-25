import {
  assert,
  assertEquals,
  assertThrowsAsync,
} from "https://deno.land/std@0.97.0/testing/asserts.ts";
import { green } from "https://deno.land/std@0.97.0/fmt/colors.ts";

import { AppError, Version, VersionInfo } from "./models.ts";

Deno.test("Version.parse - parses version number", () => {
  let v = Version.parse("1.2.3");
  assertEquals(v.major, 1);
  assertEquals(v.minor, 2);
  assertEquals(v.patch, 3);
  assertEquals(v.preid, undefined);

  v = Version.parse("2.3.4-alpha.1");
  assertEquals(v.major, 2);
  assertEquals(v.minor, 3);
  assertEquals(v.patch, 4);
  assertEquals(v.preid, "alpha.1");
});

Deno.test("Version - updates version number", () => {
  let v = Version.parse("1.2.3");
  v = v.bumpMajor();
  assertEquals(v.major, 2);
  assertEquals(v.minor, 2);
  assertEquals(v.patch, 3);
  assertEquals(v.preid, undefined);
  v = v.bumpMinor();
  assertEquals(v.major, 2);
  assertEquals(v.minor, 3);
  assertEquals(v.patch, 3);
  assertEquals(v.preid, undefined);
  v = v.bumpPatch();
  assertEquals(v.major, 2);
  assertEquals(v.minor, 3);
  assertEquals(v.patch, 4);
  assertEquals(v.preid, undefined);
  v = v.setPreid("alpha.1");
  assertEquals(v.major, 2);
  assertEquals(v.minor, 3);
  assertEquals(v.patch, 4);
  assertEquals(v.preid, "alpha.1");
  v = v.release();
  assertEquals(v.major, 2);
  assertEquals(v.minor, 3);
  assertEquals(v.patch, 4);
  assertEquals(v.preid, undefined);
});

Deno.test("VersionInfo.create", async () => {
  await assertThrowsAsync(
    async () => {
      VersionInfo.create({});
    },
    AppError,
    "Error: version property is not given in the config file",
  );
});

Deno.test("VersionInfo - toObject", async () => {
  const info = VersionInfo.create({
    version: "1.2.3",
    commit: "chore: bump to %.%.%",
    files: {
      "README.md": ["v%.%.%", "@%.%.%"],
      "main.ts": [`"%.%.%"`],
    }
  });
  assertEquals(info.toObject(), {
    version: "1.2.3",
    commit: 'chore: bump to %.%.%',
    files: {
      "README.md": ["v%.%.%", '@%.%.%'],
      "main.ts": '"%.%.%"'
    }
  });
});

Deno.test("VersionInfo.isUpdated()", async () => {
  const info = VersionInfo.create({
    version: "1.2.3",
    commit: "chore: bump to %.%.%",
    files: {
      "README.md": ["v%.%.%", "@%.%.%"],
      "main.ts": [`"%.%.%"`],
    }
  });
  assert(!info.isUpdated());
  info.major();
  assert(info.isUpdated());
});

Deno.test("VersionInfo.toString()", async () => {
  const info = VersionInfo.create({
    version: "1.2.3",
    commit: "chore: bump to %.%.%",
    files: {
      "README.md": ["v%.%.%", "@%.%.%"],
      "main.ts": [`"%.%.%"`],
    }
  });
  assertEquals(info.toString().trim(), `
Current version: ${green("1.2.3")}
Commit message: ${green("chore: bump to %.%.%")}
Version patterns:
  README.md: ${green("v%.%.%")}
  README.md: ${green("@%.%.%")}
  main.ts: ${green('"%.%.%"')}
`.trim());
});
