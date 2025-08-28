module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Code style changes (formatting, white-space, etc)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding or updating tests
        'build',    // Build system changes
        'ci',       // CI/CD changes
        'chore',    // Routine tasks, maintenance
        'revert',   // Revert previous commit
        'security', // Security improvements
        'deps',     // Dependency updates
        'release',  // Release commits
        'hotfix',   // Critical production fixes
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        // Workspaces
        'core',      // @fire22-core-dashboard
        'pattern',   // @fire22-pattern-system
        'api',       // @fire22-api-client
        'betting',   // @fire22-sports-betting
        'telegram',  // @fire22-telegram-integration
        'build',     // @fire22-build-system
        
        // Components
        'dashboard', // Dashboard UI components
        'worker',    // Cloudflare Worker logic
        'db',        // Database schemas and migrations
        'auth',      // Authentication & authorization
        'cache',     // Caching logic
        'queue',     // Queue system
        'p2p',       // P2P functionality
        
        // Infrastructure
        'docker',    // Docker configuration
        'k8s',       // Kubernetes configuration
        'cf',        // Cloudflare specific
        'monitoring',// Monitoring & observability
        'logging',   // Logging system
        
        // Development
        'lint',      // Linting rules
        'format',    // Code formatting
        'deps',      // Dependencies
        'config',    // Configuration files
        'scripts',   // Build/dev scripts
        'bench',     // Benchmarks
        'docs',      // Documentation
        'wiki',      // Wiki content
        'examples',  // Example code
        
        // Testing
        'unit',      // Unit tests
        'integration', // Integration tests
        'e2e',       // End-to-end tests
        'perf-test', // Performance tests
        
        // CI/CD
        'ci',        // CI pipeline
        'cd',        // CD pipeline
        'release',   // Release process
        'deploy',    // Deployment
        
        // Other
        'security',  // Security related
        'accessibility', // A11y improvements
        'i18n',      // Internationalization
        'analytics', // Analytics tracking
        'seo',       // SEO improvements
      ]
    ],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 100],
    'footer-max-line-length': [2, 'always', 100],
  },
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w+)(?:\((\w+)\))?: (.+)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
  // Custom prompts for interactive commit
  prompt: {
    questions: {
      type: {
        description: "Select the type of change you're committing",
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: 'A bug fix',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
            emoji: '📚',
          },
          style: {
            description: 'Changes that do not affect the meaning of the code',
            title: 'Styles',
            emoji: '💎',
          },
          refactor: {
            description: 'A code change that neither fixes a bug nor adds a feature',
            title: 'Code Refactoring',
            emoji: '📦',
          },
          perf: {
            description: 'A code change that improves performance',
            title: 'Performance Improvements',
            emoji: '🚀',
          },
          test: {
            description: 'Adding missing tests or correcting existing tests',
            title: 'Tests',
            emoji: '🚨',
          },
          build: {
            description: 'Changes that affect the build system or external dependencies',
            title: 'Builds',
            emoji: '🛠',
          },
          ci: {
            description: 'Changes to CI configuration files and scripts',
            title: 'Continuous Integrations',
            emoji: '⚙️',
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: 'Chores',
            emoji: '♻️',
          },
          revert: {
            description: 'Reverts a previous commit',
            title: 'Reverts',
            emoji: '🗑',
          },
          security: {
            description: 'Security improvements or fixes',
            title: 'Security',
            emoji: '🔒',
          },
          deps: {
            description: 'Dependency updates',
            title: 'Dependencies',
            emoji: '📦',
          },
        },
      },
    },
  },
};