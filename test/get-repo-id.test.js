const test = require('ava');
const getRepoId = require('../lib/get-repo-id');

test('Parse repo id with https URL', t => {
  t.is(getRepoId({env: {}}, 'https://gitlbab.com', 'https://gitee.com/owner/repo.git'), 'owner/repo');
  t.is(getRepoId({env: {}}, 'https://gitlbab.com', 'https://gitee.com/owner/repo'), 'owner/repo');
});

test('Parse repo id with git URL', t => {
  t.is(getRepoId({env: {}}, 'https://gitee.com', 'git+ssh://git@gitee.com/owner/repo.git'), 'owner/repo');
  t.is(getRepoId({env: {}}, 'https://gitee.com', 'git+ssh://git@gitee.com/owner/repo'), 'owner/repo');
});

test('Parse repo id with context in repo URL', t => {
  t.is(getRepoId({env: {}}, 'https://gitee.com/context', 'https://gitee.com/context/owner/repo.git'), 'owner/repo');
  t.is(
    getRepoId({env: {}}, 'https://gitee.com/context', 'git+ssh://git@gitee.com/context/owner/repo.git'),
    'owner/repo'
  );
});

test('Parse repo id with context not in repo URL', t => {
  t.is(getRepoId({env: {}}, 'https://gitee.com/context', 'https://gitee.com/owner/repo.git'), 'owner/repo');
  t.is(getRepoId({env: {}}, 'https://gitee.com/context', 'git+ssh://git@gitee.com/owner/repo.git'), 'owner/repo');
});

test('Parse repo id with organization and subgroup', t => {
  t.is(getRepoId({env: {}}, 'https://gitee.com/context', 'https://gitee.com/owner/repo.git'), 'owner/repo');
  t.is(getRepoId({env: {}}, 'https://gitee.com/context', 'git+ssh://git@gitee.com/owner/repo.git'), 'owner/repo');
});
