#!/usr/bin/env node

/**
 * squash-commits.js
 * Script to merge all commits from the current branch into one
 *
 * Usage: node squash-commits.js [commit message]
 * If no commit message is provided, a default message will be used: "[branch name] merged"
 */

const { execSync } = require('child_process');
const readline = require('readline');

// Get commit message from command line arguments if provided
const providedCommitMessage = process.argv.slice(2).join(' ');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to execute shell commands and return the output
function execCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Main function
async function squashCommits() {
  try {
    // Get the current branch name
    const currentBranch = execCommand('git rev-parse --abbrev-ref HEAD');

    // Check if we're on a branch (not in a detached HEAD state)
    if (currentBranch === 'HEAD') {
      console.error('Error: You are in a detached HEAD state. Please checkout a branch first.');
      process.exit(1);
    }

    // Check if there are any uncommitted changes
    try {
      execCommand('git diff-index --quiet HEAD --');
    } catch (error) {
      console.error('Error: You have uncommitted changes. Please commit or stash them first.');
      process.exit(1);
    }

    console.log(`Current branch: ${currentBranch}`);

    // Get the number of commits in the current branch
    const commitCount = parseInt(execCommand('git rev-list --count HEAD'), 10);
    console.log(`Number of commits in branch: ${commitCount}`);

    if (commitCount <= 1) {
      console.log("There's only one commit or no commits in this branch. Nothing to squash.");
      process.exit(0);
    }

    // Get the commit message for the squashed commit
    let commitMessage;

    if (providedCommitMessage) {
      // Use the commit message provided as a command-line argument
      commitMessage = providedCommitMessage;
      console.log(`Using provided commit message: ${commitMessage}`);
    } else {
      // If no command-line argument was provided, use the default message
      const defaultMessage = `[${currentBranch}] merged`;
      commitMessage = defaultMessage;
      console.log(`Using default commit message: ${defaultMessage}`);
    }

    // Create a temporary branch
    const tempBranch = `temp-squash-branch-${Date.now()}`;
    console.log(`Creating temporary branch: ${tempBranch}`);
    execCommand(`git checkout -b ${tempBranch}`);

    // Get the root commit of the branch or the first commit if it's the main branch
    let rootCommit;
    if (currentBranch === 'main' || currentBranch === 'master') {
      // For main/master, we'll use a soft reset to the first commit
      rootCommit = execCommand('git rev-list --max-parents=0 HEAD');
    } else {
      // For feature branches, find the commit where it diverged from main/master
      const baseBranch = execCommand('git show-ref --verify --quiet refs/heads/main && echo "main" || echo "master"');
      rootCommit = execCommand(`git merge-base ${currentBranch} ${baseBranch}`);
    }

    // Perform the squash using soft reset
    console.log('Squashing commits...');
    execCommand(`git reset --soft ${rootCommit}`);
    execCommand(`git commit -m "${commitMessage}"`);

    // Switch back to the original branch
    execCommand(`git checkout ${currentBranch}`);

    // Force update the original branch to point to our squashed commit
    console.log(`Updating ${currentBranch} with the squashed commit...`);
    execCommand(`git reset --hard ${tempBranch}`);

    // Clean up the temporary branch
    execCommand(`git branch -D ${tempBranch}`);

    console.log(`Successfully squashed all commits in ${currentBranch} into one commit.`);
    console.log(`Commit message: ${commitMessage}`);

    // Force push to remote on all branches
    console.log(`Force pushing to origin ${currentBranch}...`);
    try {
      execCommand(`git push -f origin ${currentBranch}`);
      console.log(`Successfully pushed to origin ${currentBranch}.`);
    } catch (error) {
      console.warn(`Warning: Could not push to remote: ${error.message}`);
      console.warn('You may need to manually push with: git push -f origin ' + currentBranch);
    }

    rl.close();
  } catch (error) {
    console.error('An error occurred:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the main function
squashCommits();
