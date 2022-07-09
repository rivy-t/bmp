import {
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.97.0/testing/asserts.ts";

const decoder = new TextDecoder();

const permissionsRequired = ["--allow-read", "--allow-run"];
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

// Deno.test('* required testing permissions *', () => {
// 	if (!allPermissionsGranted) {
// 		console.warn('Re-run test file with all required permissions', permissionsRequired);
// 	}
// 	// assertEquals(allPermissionsGranted, true, 'Missing required permissions');
// 	if (!allPermissionsGranted) throw new Error('Missing required permissions');
// });
// if (allPermissionsGranted) {
Deno.test("cli --help", async () => {
  const p = Deno.run({
    cmd: [Deno.execPath(), "run", "cli.ts", "--help"],
    stdout: "piped",
    stderr: "piped",
  });

  const [status, output, _stderrOutput] = await Promise.all([
    p.status(),
    p.output(),
    p.stderrOutput(),
  ]);

  assertEquals(status.code, 0);
  assertStringIncludes(decoder.decode(output), "Usage:");
  p.close();
});

Deno.test("cli --version", async () => {
  const p = Deno.run({
    cmd: [Deno.execPath(), "run", "cli.ts", "--version"],
    stdout: "piped",
    stderr: "piped",
  });

  const [status, output, _stderrOutput] = await Promise.all([
    p.status(),
    p.output(),
    p.stderrOutput(),
  ]);

  assertEquals(status.code, 0);
  assertStringIncludes(decoder.decode(output), "bmp@");
  p.close();
});
// }
