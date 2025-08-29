/**
 * Syntax Error Fixer
 * Domain-Driven Design Implementation
 *
 * Automated script to fix common syntax errors found by prettier
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface SyntaxFix {
  pattern: RegExp;
  replacement: string;
  description: string;
}

const syntaxFixes: SyntaxFix[] = [
  // Fix strict equality operator typos
  {
    pattern: /====/g,
    replacement: '===',
    description: 'Fix strict equality operator (==== → ===)'
  },
  {
    pattern: /====/g,
    replacement: '!==',
    description: 'Fix strict inequality operator (==== → !==)'
  },
  // Fix missing semicolons after console.log
  {
    pattern: /console\.log\(([^)]+)\)\s*\n\s*}/g,
    replacement: 'console.log($1);\n}',
    description: 'Add missing semicolons after console.log'
  },
  // Fix template literal syntax
  {
    pattern: /\$\{([^}]+)\}/g,
    replacement: '\\${$1}',
    description: 'Fix template literal escaping'
  },
  // Fix invalid characters in strings
  {
    pattern: /[^\x20-\x7E\n\r\t]/g,
    replacement: '',
    description: 'Remove invalid characters'
  }
];

async function fixSyntaxErrors() {
  console.log('🔧 Syntax Error Fixer Starting...');
  console.log('=================================\n');

  const files = [
    'src/**/*.ts',
    'crystal-clear-architecture/**/*.ts',
    'crystal-clear-architecture/**/*.html',
    'dashboard-worker/**/*.ts',
    'dashboard-worker/**/*.html'
  ];

  let totalFiles = 0;
  let fixedFiles = 0;
  let totalFixes = 0;

  for (const pattern of files) {
    console.log(`📁 Processing pattern: ${pattern}`);

    const globFiles = await Array.fromAsync(Bun.glob(pattern));

    for (const file of globFiles) {
      totalFiles++;
      const filePath = join(process.cwd(), file);
      let content = readFileSync(filePath, 'utf-8');
      let fileFixed = false;
      let fileFixes = 0;

      for (const fix of syntaxFixes) {
        const matches = content.match(fix.pattern);
        if (matches) {
          const before = content;
          content = content.replace(fix.pattern, fix.replacement);
          if (content !== before) {
            fileFixed = true;
            fileFixes += matches.length;
            totalFixes += matches.length;
            console.log(`   ✅ ${fix.description}: ${matches.length} fixes`);
          }
        }
      }

      if (fileFixed) {
        writeFileSync(filePath, content, 'utf-8');
        fixedFiles++;
        console.log(`   📄 Fixed: ${file} (${fileFixes} fixes)`);
      }
    }
  }

  console.log('\n📊 Fix Summary:');
  console.log(`   📁 Total files processed: ${totalFiles}`);
  console.log(`   🔧 Files fixed: ${fixedFiles}`);
  console.log(`   ✅ Total fixes applied: ${totalFixes}`);
  console.log('');

  if (fixedFiles > 0) {
    console.log('🎉 Syntax errors fixed! Now run prettier again:');
    console.log('   bunx prettier@3.2.5 --write .');
  } else {
    console.log('✨ No syntax errors found that can be auto-fixed.');
    console.log('   Check the prettier output for remaining issues.');
  }
}

async function manualFixSuggestions() {
  console.log('\n💡 Manual Fix Suggestions:');
  console.log('==========================');

  console.log('1. HTML Syntax Errors:');
  console.log('   - Check for unclosed tags');
  console.log('   - Verify proper nesting');
  console.log('   - Remove duplicate closing tags');

  console.log('\n2. TypeScript Errors:');
  console.log('   - Check for missing imports');
  console.log('   - Verify type definitions');
  console.log('   - Fix function declarations');

  console.log('\n3. Invalid Characters:');
  console.log('   - Remove non-ASCII characters');
  console.log('   - Check for corrupted files');
  console.log('   - Verify file encoding');

  console.log('\n4. Template Literals:');
  console.log('   - Use backticks for template literals');
  console.log('   - Properly escape ${} expressions');
  console.log('   - Check for nested quotes');

  console.log('\n🚀 After manual fixes, run:');
  console.log('   bunx prettier@3.2.5 --write .');
  console.log('   bunx prettier@3.2.5 --check .');
}

if (import.meta.main) {
  await fixSyntaxErrors();
  manualFixSuggestions();
}
