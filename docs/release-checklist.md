# Release Checklist

Use this checklist before and after publishing a new version of `combine-maccy-pastes`.

## Before Publish

1. Update `package.json` version and confirm the README examples still match the CLI.
2. Run `npm test`.
3. Run `npm pack --pack-destination /tmp` and inspect the tarball contents.
4. Smoke-test the packed CLI:

   ```bash
   npm exec --yes /tmp/combine-maccy-pastes-<version>.tgz -- --help
   ```

5. Commit the release changes to git.

## Publish

1. Authenticate with npm if needed: `npm whoami` or `npm adduser`.
2. Publish: `npm publish`.
3. Verify the registry result:

   ```bash
   npm view combine-maccy-pastes version dist.tarball
   npm exec --yes combine-maccy-pastes@<version> -- --help
   ```

## After Publish

1. Create or update the git tag for the released commit: `git tag -a v<version> -m "v<version>"`.
2. Push commits and tags: `git push && git push --tags`.
3. Confirm GitHub Actions passed on the release commit or tag.
