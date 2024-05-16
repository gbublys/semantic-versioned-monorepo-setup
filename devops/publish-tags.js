// Since git only allows three tags to be pushed at a time,
// we need to publish tags in batches,
// so that GitHub Actions are triggered for each batch.
const { execSync } = require('child_process');

process.stdout.write('Fetching remote tags: ');
const remoteTags = getRemoteTags();
process.stdout.write(`${remoteTags.length} tags fetched\n`);

process.stdout.write('Reading remote tags: ');
const localTags = getLocalTags();
process.stdout.write(`${localTags.length} tags read\n`);

const unpublishedTags = localTags.filter((tag) => !remoteTags.includes(tag));

if (unpublishedTags.length === 0) {
  console.log('No tags to push');
} else {
  console.log(`Pushing ${unpublishedTags.length} tags:`);

  unpublishedTags.forEach((tag) => {
    process.stdout.write(`* ${tag}: `);
    execSync(`git push origin ${tag} --dry-run`, { stdio: 'pipe' });
    process.stdout.write(`done\n`);
  });
}

function getRemoteTags() {
  try {
    const stdout = execSync('git ls-remote --tags origin');

    // stdout is a string with each tag reference on a new line
    // split it into an array of tag references
    const tagRefs = stdout.toString().split('\n').filter(Boolean);

    // Each tag reference is a string that looks like this:
    // '1234567890abcdef1234567890abcdef12345678	refs/tags/v1.0'
    // We're interested in the part after 'refs/tags/', which is the tag name
    return tagRefs
      .map((ref) => `${ref.split('refs/tags/').pop()}`)
      .filter((t) => !`${t}`.endsWith('^{}'));
  } catch (e) {
    throw Error('Failed to get remote tags');
  }
}

function getLocalTags() {
  try {
    const stdout = execSync('git tag');
    return stdout.toString().split('\n').filter(Boolean);
  } catch (e) {
    throw Error('Failed to get local tags');
  }
}
