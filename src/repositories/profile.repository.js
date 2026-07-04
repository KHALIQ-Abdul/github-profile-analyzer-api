const { pool } = require('../config/db');

function serializeProfile(profile) {
  return {
    ...profile,
    languages: JSON.stringify(profile.languages || []),
    top_repositories: JSON.stringify(profile.top_repositories || []),
    recent_repositories: JSON.stringify(profile.recent_repositories || []),
    repo_topics: JSON.stringify(profile.repo_topics || [])
  };
}

function parseJsonFields(row) {
  if (!row) return row;
  return {
    ...row,
    languages: typeof row.languages === 'string' ? JSON.parse(row.languages || '[]') : row.languages,
    top_repositories: typeof row.top_repositories === 'string' ? JSON.parse(row.top_repositories || '[]') : row.top_repositories,
    recent_repositories: typeof row.recent_repositories === 'string' ? JSON.parse(row.recent_repositories || '[]') : row.recent_repositories,
    repo_topics: typeof row.repo_topics === 'string' ? JSON.parse(row.repo_topics || '[]') : row.repo_topics
  };
}

async function upsertProfile(profile) {
  const p = serializeProfile(profile);

  const sql = `
    INSERT INTO github_profiles (
      github_id, username, name, avatar_url, html_url, bio, company, location, blog, twitter_username,
      public_repos, public_gists, followers, following, account_created_at, github_updated_at,
      total_stars, total_forks, total_watchers, original_repos_count, forked_repos_count, archived_repos_count,
      top_language, languages, top_repositories, recent_repositories, repo_topics, analysis_score, insight_summary, analyzed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      github_id = VALUES(github_id),
      name = VALUES(name),
      avatar_url = VALUES(avatar_url),
      html_url = VALUES(html_url),
      bio = VALUES(bio),
      company = VALUES(company),
      location = VALUES(location),
      blog = VALUES(blog),
      twitter_username = VALUES(twitter_username),
      public_repos = VALUES(public_repos),
      public_gists = VALUES(public_gists),
      followers = VALUES(followers),
      following = VALUES(following),
      account_created_at = VALUES(account_created_at),
      github_updated_at = VALUES(github_updated_at),
      total_stars = VALUES(total_stars),
      total_forks = VALUES(total_forks),
      total_watchers = VALUES(total_watchers),
      original_repos_count = VALUES(original_repos_count),
      forked_repos_count = VALUES(forked_repos_count),
      archived_repos_count = VALUES(archived_repos_count),
      top_language = VALUES(top_language),
      languages = VALUES(languages),
      top_repositories = VALUES(top_repositories),
      recent_repositories = VALUES(recent_repositories),
      repo_topics = VALUES(repo_topics),
      analysis_score = VALUES(analysis_score),
      insight_summary = VALUES(insight_summary),
      analyzed_at = VALUES(analyzed_at)
  `;

  const values = [
    p.github_id, p.username, p.name, p.avatar_url, p.html_url, p.bio, p.company, p.location, p.blog, p.twitter_username,
    p.public_repos, p.public_gists, p.followers, p.following, p.account_created_at, p.github_updated_at,
    p.total_stars, p.total_forks, p.total_watchers, p.original_repos_count, p.forked_repos_count, p.archived_repos_count,
    p.top_language, p.languages, p.top_repositories, p.recent_repositories, p.repo_topics, p.analysis_score, p.insight_summary, p.analyzed_at
  ];

  await pool.execute(sql, values);
  return findByUsername(profile.username);
}

async function findAll({ page = 1, limit = 10, search = '', sortBy = 'analyzed_at', order = 'DESC' }) {
  const allowedSort = new Set(['analyzed_at', 'followers', 'public_repos', 'analysis_score', 'total_stars', 'username']);
  const safeSortBy = allowedSort.has(sortBy) ? sortBy : 'analyzed_at';
  const safeOrder = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;
  const likeSearch = `%${search}%`;

  const [rows] = await pool.execute(
    `SELECT * FROM github_profiles
     WHERE username LIKE ? OR name LIKE ? OR top_language LIKE ?
     ORDER BY ${safeSortBy} ${safeOrder}
     LIMIT ? OFFSET ?`,
    [likeSearch, likeSearch, likeSearch, Number(limit), Number(offset)]
  );

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM github_profiles
     WHERE username LIKE ? OR name LIKE ? OR top_language LIKE ?`,
    [likeSearch, likeSearch, likeSearch]
  );

  return {
    rows: rows.map(parseJsonFields),
    total: countRows[0].total
  };
}

async function findByUsername(username) {
  const [rows] = await pool.execute(
    'SELECT * FROM github_profiles WHERE LOWER(username) = LOWER(?) LIMIT 1',
    [username]
  );
  return parseJsonFields(rows[0]);
}

async function removeByUsername(username) {
  const [result] = await pool.execute(
    'DELETE FROM github_profiles WHERE LOWER(username) = LOWER(?)',
    [username]
  );
  return result.affectedRows > 0;
}

module.exports = { upsertProfile, findAll, findByUsername, removeByUsername };
