#!/usr/bin/env bun

import { readFile } from 'fs/promises';
import { join } from 'path';

// Department Lead and Team Directory
const DEPARTMENT_TEAMS = {
  finance: {
    lead: { name: 'John Smith', email: 'john.smith@finance.fire22' },
    members: [
      { name: 'Sarah Johnson', email: 'sarah.johnson@finance.fire22' },
      { name: 'Mike Chen', email: 'mike.chen@finance.fire22' },
    ],
    lkeys: ['L-69', 'L-627', 'L-628', 'L-187', 'L-202', 'L-206'],
  },
  support: {
    lead: { name: 'Emily Davis', email: 'emily.davis@support.fire22' },
    members: [{ name: 'Alex Wilson', email: 'alex.wilson@support.fire22' }],
    lkeys: ['L-301', 'L-302', 'L-303'],
  },
  compliance: {
    lead: { name: 'Lisa Anderson', email: 'lisa.anderson@compliance.fire22' },
    members: [{ name: 'Robert Taylor', email: 'robert.taylor@compliance.fire22' }],
    lkeys: ['L-401', 'L-402', 'L-403'],
  },
  operations: {
    lead: { name: 'David Martinez', email: 'david.martinez@operations.fire22' },
    members: [{ name: 'Jennifer Lee', email: 'jennifer.lee@operations.fire22' }],
    lkeys: ['L-12', 'L-15', 'L-16', 'L-85', 'L-1390'],
  },
  technology: {
    lead: { name: 'Chris Brown', email: 'chris.brown@tech.fire22' },
    members: [{ name: 'Amanda Garcia', email: 'amanda.garcia@tech.fire22' }],
    lkeys: ['L-501', 'L-502', 'L-503'],
  },
  marketing: {
    lead: { name: 'Michelle Rodriguez', email: 'michelle.rodriguez@marketing.fire22' },
    members: [{ name: 'Kevin Thompson', email: 'kevin.thompson@marketing.fire22' }],
    lkeys: ['L-601', 'L-602', 'L-603'],
  },
  management: {
    lead: { name: 'William Harris', email: 'william.harris@exec.fire22' },
    members: [{ name: 'Patricia Clark', email: 'patricia.clark@exec.fire22' }],
    lkeys: ['L-701', 'L-702', 'L-703'],
  },
  contributors: {
    lead: { name: 'Alex Chen', email: 'alex.chen@team.fire22' },
    members: [
      { name: 'Jordan Taylor', email: 'jordan.taylor@team.fire22' },
      { name: 'Sam Wilson', email: 'sam.wilson@team.fire22' },
      { name: 'Morgan Lee', email: 'morgan.lee@team.fire22' },
      { name: 'Casey Brown', email: 'casey.brown@team.fire22' },
    ],
    lkeys: ['L-801', 'L-802', 'L-803'],
  },
};

// Commit types with examples
const COMMIT_TYPES = {
  feat: 'Add new feature or functionality',
  fix: 'Fix a bug or issue',
  docs: 'Update documentation',
  style: 'Code style changes (formatting, etc.)',
  refactor: 'Code refactoring without behavior change',
  perf: 'Performance improvements',
  test: 'Add or update tests',
  build: 'Build system or dependencies',
  ci: 'CI/CD configuration changes',
  chore: 'Maintenance tasks',
};

function generateCommitTemplate(
  department,
  commitType,
  description,
  lkeys = [],
  contributors = [],
  customContributors = []
) {
  const dept = DEPARTMENT_TEAMS[department];
  if (!dept) {
    throw new Error(
      `Unknown department: ${department}. Available: ${Object.keys(DEPARTMENT_TEAMS).join(', ')}`
    );
  }

  if (!COMMIT_TYPES[commitType]) {
    throw new Error(
      `Unknown commit type: ${commitType}. Available: ${Object.keys(COMMIT_TYPES).join(', ')}`
    );
  }

  // Build contributors list
  const contributorsList = [];

  // Add specified team members
  contributors.forEach(name => {
    const member = dept.members.find(m => m.name.includes(name) || name.includes(m.name));
    if (member) {
      contributorsList.push(`${member.name} <${member.email}>`);
    }
  });

  // Add custom contributors with email validation
  customContributors.forEach(contributor => {
    if (contributor.email && contributor.email.includes('@fire22')) {
      contributorsList.push(`${contributor.name} <${contributor.email}>`);
    }
  });

  // Build L-Keys section
  const lkeySection = lkeys.length > 0 ? `\nL-Keys: ${lkeys.join(', ')}` : '';

  // Build contributors section
  const contributorsSection =
    contributorsList.length > 0 ? `\nContributors: ${contributorsList.join(', ')}` : '';

  const template = `${commitType}(${department}): ${description}

Department: ${dept.lead.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')}
Lead: ${dept.lead.name} <${dept.lead.email}>${contributorsSection}${lkeySection}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

  return template;
}

// CLI Interface
function showHelp() {
  console.log(`
🔥 Fire22 Enhanced Commit Message Generator

Usage: bun run scripts/enhanced-commit-template.js [options]

Options:
  --department, -d    Department (required)
  --type, -t          Commit type (required)
  --desc, -m          Description (required)
  --lkeys, -l         L-Keys (comma-separated)
  --contributors, -c  Team contributors (comma-separated names)
  --custom           Custom contributors (format: "Name<email>,Name<email>")
  --help, -h         Show this help

Available Departments:
${Object.keys(DEPARTMENT_TEAMS)
  .map(d => `  • ${d}`)
  .join('\n')}

Available Commit Types:
${Object.entries(COMMIT_TYPES)
  .map(([type, desc]) => `  • ${type}: ${desc}`)
  .join('\n')}

Examples:

# Basic finance commit
bun run scripts/enhanced-commit-template.js \\
  --department finance \\
  --type feat \\
  --desc "implement L-69 transaction tracking system"

# With L-Keys and contributors  
bun run scripts/enhanced-commit-template.js \\
  --department finance \\
  --type feat \\
  --desc "implement automated reconciliation system" \\
  --lkeys "L-69,L-187,L-202" \\
  --contributors "Sarah Johnson,Mike Chen"

# With custom external contributors
bun run scripts/enhanced-commit-template.js \\
  --department technology \\
  --type feat \\
  --desc "integrate third-party API system" \\
  --custom "External Dev<dev@vendor.com>,Consultant<expert@consulting.com>"

# Operations with betting L-Keys
bun run scripts/enhanced-commit-template.js \\
  --department operations \\
  --type feat \\
  --desc "enhance live betting system with new bet types" \\
  --lkeys "L-12,L-15,L-16,L-85,L-1390"
`);
}

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
      case '--department':
      case '-d':
        options.department = nextArg;
        i++;
        break;
      case '--type':
      case '-t':
        options.type = nextArg;
        i++;
        break;
      case '--desc':
      case '-m':
        options.desc = nextArg;
        i++;
        break;
      case '--lkeys':
      case '-l':
        options.lkeys = nextArg ? nextArg.split(',').map(k => k.trim()) : [];
        i++;
        break;
      case '--contributors':
      case '-c':
        options.contributors = nextArg ? nextArg.split(',').map(c => c.trim()) : [];
        i++;
        break;
      case '--custom':
        options.custom = nextArg
          ? nextArg
              .split(',')
              .map(c => {
                const match = c.match(/(.+)<(.+)>/);
                return match ? { name: match[1].trim(), email: match[2].trim() } : null;
              })
              .filter(Boolean)
          : [];
        i++;
        break;
    }
  }

  return options;
}

// Main function
function main() {
  try {
    const options = parseArgs();

    // Validate required options
    if (!options.department) {
      throw new Error('Department is required (use --department or -d)');
    }
    if (!options.type) {
      throw new Error('Commit type is required (use --type or -t)');
    }
    if (!options.desc) {
      throw new Error('Description is required (use --desc or -m)');
    }

    const commitMessage = generateCommitTemplate(
      options.department,
      options.type,
      options.desc,
      options.lkeys || [],
      options.contributors || [],
      options.custom || []
    );

    console.log('\n🔥 Generated Commit Message:\n');
    console.log('─'.repeat(50));
    console.log(commitMessage);
    console.log('─'.repeat(50));

    console.log('\n📋 To use this commit message:');
    console.log('git add .');
    console.log(`git commit -S -m "${commitMessage.replace(/\n/g, '\\n').replace(/"/g, '\\"')}"`);

    console.log('\n💾 Or save to file:');
    console.log(
      'echo "' + commitMessage.replace(/\n/g, '\\n').replace(/"/g, '\\"') + '" > .gitmessage'
    );
    console.log('git commit -S --file .gitmessage');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nUse --help for usage information');
    process.exit(1);
  }
}

// Export for use as module
export { generateCommitTemplate, DEPARTMENT_TEAMS, COMMIT_TYPES };

// Run if called directly
if (import.meta.main) {
  main();
}
