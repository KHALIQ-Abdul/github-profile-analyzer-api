const { pool } = require('./db');

async function initDatabase() {
  const sql = `
    CREATE TABLE IF NOT EXISTS github_profiles (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      github_id BIGINT UNSIGNED NOT NULL,
      username VARCHAR(100) NOT NULL,
      name VARCHAR(255) NULL,
      avatar_url TEXT NULL,
      html_url TEXT NOT NULL,
      bio TEXT NULL,
      company VARCHAR(255) NULL,
      location VARCHAR(255) NULL,
      blog TEXT NULL,
      twitter_username VARCHAR(100) NULL,
      public_repos INT UNSIGNED DEFAULT 0,
      public_gists INT UNSIGNED DEFAULT 0,
      followers INT UNSIGNED DEFAULT 0,
      following INT UNSIGNED DEFAULT 0,
      account_created_at DATETIME NULL,
      github_updated_at DATETIME NULL,

      total_stars INT UNSIGNED DEFAULT 0,
      total_forks INT UNSIGNED DEFAULT 0,
      total_watchers INT UNSIGNED DEFAULT 0,
      original_repos_count INT UNSIGNED DEFAULT 0,
      forked_repos_count INT UNSIGNED DEFAULT 0,
      archived_repos_count INT UNSIGNED DEFAULT 0,
      top_language VARCHAR(100) NULL,
      languages JSON NULL,
      top_repositories JSON NULL,
      recent_repositories JSON NULL,
      repo_topics JSON NULL,
      analysis_score DECIMAL(5,2) DEFAULT 0.00,
      insight_summary TEXT NULL,

      analyzed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      PRIMARY KEY (id),
      UNIQUE KEY uq_github_profiles_username (username),
      UNIQUE KEY uq_github_profiles_github_id (github_id),
      INDEX idx_followers (followers),
      INDEX idx_public_repos (public_repos),
      INDEX idx_analysis_score (analysis_score),
      INDEX idx_analyzed_at (analyzed_at)
    );
  `;

  await pool.execute(sql);
}

module.exports = { initDatabase };
