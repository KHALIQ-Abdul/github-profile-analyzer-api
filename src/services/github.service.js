const axios = require('axios');
const { githubToken } = require('../config/env');

const githubClient = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 15000,
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'github-profile-analyzer-api',
    ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {})
  }
});

function countBy(items, keyGetter) {
  return items.reduce((acc, item) => {
    const key = keyGetter(item);
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function toSortedArray(obj) {
  return Object.entries(obj)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function calculateScore({ user, repos, totalStars, totalForks }) {
  // Simple explainable score out of 100, balanced for junior assignment demo.
  const repoScore = Math.min(user.public_repos || 0, 50) * 0.5; // max 25
  const followerScore = Math.min(user.followers || 0, 1000) * 0.025; // max 25
  const starScore = Math.min(totalStars || 0, 1000) * 0.025; // max 25
  const forkScore = Math.min(totalForks || 0, 500) * 0.02; // max 10
  const profileScore = [user.bio, user.location, user.blog, user.company].filter(Boolean).length * 3.75; // max 15
  return Number(Math.min(repoScore + followerScore + starScore + forkScore + profileScore, 100).toFixed(2));
}

function buildInsightSummary({ user, totalStars, totalForks, topLanguage, originalReposCount, forkedReposCount }) {
  const pieces = [];
  pieces.push(`${user.login} has ${user.public_repos} public repositories, ${user.followers} followers and follows ${user.following} users.`);
  pieces.push(`Across the analyzed repositories, the profile has ${totalStars} stars and ${totalForks} forks.`);
  if (topLanguage) pieces.push(`Most frequently used language is ${topLanguage}.`);
  pieces.push(`${originalReposCount} repositories are original and ${forkedReposCount} are forks.`);
  return pieces.join(' ');
}

async function fetchAllPublicRepos(username) {
  const allRepos = [];
  let page = 1;
  const maxPages = 3; // 300 repos max keeps API fast for assignment/demo.

  while (page <= maxPages) {
    const { data } = await githubClient.get(`/users/${encodeURIComponent(username)}/repos`, {
      params: {
        per_page: 100,
        page,
        sort: 'updated',
        direction: 'desc'
      }
    });

    allRepos.push(...data);
    if (data.length < 100) break;
    page += 1;
  }

  return allRepos;
}

async function analyzeGithubProfile(username) {
  const normalizedUsername = username.trim();
  const [{ data: user }, repos] = await Promise.all([
    githubClient.get(`/users/${encodeURIComponent(normalizedUsername)}`),
    fetchAllPublicRepos(normalizedUsername)
  ]);

  const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
  const totalWatchers = repos.reduce((sum, repo) => sum + (repo.watchers_count || 0), 0);
  const forkedReposCount = repos.filter((repo) => repo.fork).length;
  const archivedReposCount = repos.filter((repo) => repo.archived).length;
  const originalReposCount = repos.length - forkedReposCount;

  const languages = toSortedArray(countBy(repos, (repo) => repo.language));
  const topLanguage = languages[0]?.name || null;
  const topics = toSortedArray(
    repos.flatMap((repo) => repo.topics || []).reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {})
  );

  const topRepositories = [...repos]
    .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (b.forks_count - a.forks_count))
    .slice(0, 5)
    .map((repo) => ({
      name: repo.name,
      full_name: repo.full_name,
      html_url: repo.html_url,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      open_issues: repo.open_issues_count,
      updated_at: repo.updated_at
    }));

  const recentRepositories = repos.slice(0, 5).map((repo) => ({
    name: repo.name,
    html_url: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    updated_at: repo.updated_at
  }));

  const score = calculateScore({ user, repos, totalStars, totalForks });
  const insightSummary = buildInsightSummary({
    user,
    totalStars,
    totalForks,
    topLanguage,
    originalReposCount,
    forkedReposCount
  });

  return {
    github_id: user.id,
    username: user.login,
    name: user.name,
    avatar_url: user.avatar_url,
    html_url: user.html_url,
    bio: user.bio,
    company: user.company,
    location: user.location,
    blog: user.blog,
    twitter_username: user.twitter_username,
    public_repos: user.public_repos,
    public_gists: user.public_gists,
    followers: user.followers,
    following: user.following,
    account_created_at: user.created_at ? new Date(user.created_at) : null,
    github_updated_at: user.updated_at ? new Date(user.updated_at) : null,
    total_stars: totalStars,
    total_forks: totalForks,
    total_watchers: totalWatchers,
    original_repos_count: originalReposCount,
    forked_repos_count: forkedReposCount,
    archived_repos_count: archivedReposCount,
    top_language: topLanguage,
    languages,
    top_repositories: topRepositories,
    recent_repositories: recentRepositories,
    repo_topics: topics.slice(0, 15),
    analysis_score: score,
    insight_summary: insightSummary,
    analyzed_at: new Date()
  };
}

module.exports = { analyzeGithubProfile };
