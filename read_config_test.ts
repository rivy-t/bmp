import {
  assertEquals,
  assertThrowsAsync,
} from "https://deno.land/std@0.97.0/testing/asserts.ts";
import { AppError } from "./models.ts";
import { readConfig } from "./read_config.ts";

const permissionsRequired = ["--allow-read"];
const permissionsGranted = await Promise.all(
  permissionsRequired.map(async (cliPermission) => {
    return ((await Deno.permissions.query(
      {
        name: cliPermission.replace(/^--allow-/, ""),
      } as Deno.PermissionDescriptor,
    ))
      .state) === "granted";
  }),
);
const allPermissionsGranted = permissionsGranted.find((v) => !v) ?? true;
// console.warn({ permissionsRequired, permissionsGranted, allPermissionsGranted });
if (!allPermissionsGranted) {
  // console.warn('Re-run test file with all required permissions', permissionsRequired);
  throw new Error(
    "Missing required testing permissions; re-run test file with all required permissions " +
      Deno
        .inspect(permissionsRequired),
  );
}

Deno.test("readConfig - throws when the config file is not found", async () => {
  await assertThrowsAsync(
    async () => {
      await readConfig({ file: "somedir/.bmp.yml" });
    },
    AppError,
    "Error: The config file 'somedir/.bmp.yml' not found",
  );
});

Deno.test("readConfig - throws when the config file has syntax error", async () => {
  await assertThrowsAsync(
    async () => {
      await readConfig({ file: "testdata/.bmp.yml.broken" });
    },
    AppError,
    "end of the stream or a document separator is expected at line 2, column 6:",
  );
});
