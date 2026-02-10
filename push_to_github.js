
import { Octokit } from '@octokit/rest'
import fs from 'fs'
import path from 'path'

let connectionSettings;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  const response = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  );
  
  const data = await response.json();
  connectionSettings = data.items?.[0];

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

export async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

async function pushToGithub() {
  try {
    const octokit = await getUncachableGitHubClient();
    const owner = 'nhshajib';
    const repo = 'timer';
    const branch = 'main';

    console.log(`Pushing to ${owner}/${repo} on branch ${branch}...`);

    // Get the current commit SHA for the branch
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });
    const currentCommitSha = refData.object.sha;

    // Get the tree SHA for the current commit
    const { data: commitData } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: currentCommitSha,
    });
    const baseTreeSha = commitData.tree.sha;

    // Helper to get all files recursively
    const getAllFiles = (dirPath, arrayOfFiles) => {
      const files = fs.readdirSync(dirPath);
      arrayOfFiles = arrayOfFiles || [];
      files.forEach((file) => {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
          if (file !== '.git' && file !== 'node_modules' && file !== 'dist') {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
          }
        } else {
          arrayOfFiles.push(path.join(dirPath, "/", file));
        }
      });
      return arrayOfFiles;
    };

    const filesToUpload = getAllFiles('.', []);
    const tree = [];

    for (const file of filesToUpload) {
      const relativePath = path.relative('.', file);
      const content = fs.readFileSync(file, 'utf8');
      
      const { data: blobData } = await octokit.git.createBlob({
        owner,
        repo,
        content,
        encoding: 'utf-8',
      });

      tree.push({
        path: relativePath,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha,
      });
    }

    // Create a new tree
    const { data: newTreeData } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree,
    });

    // Create a new commit
    const { data: newCommitData } = await octokit.git.createCommit({
      owner,
      repo,
      message: 'Redesign UI and fix voice feedback',
      tree: newTreeData.sha,
      parents: [currentCommitSha],
    });

    // Update the reference
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommitData.sha,
    });

    console.log('Successfully pushed to GitHub!');
  } catch (error) {
    console.error('Error pushing to GitHub:', error);
    process.exit(1);
  }
}

pushToGithub();
