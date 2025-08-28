#!/usr/bin/env bun

import { readFileSync, writeFileSync } from 'fs';

function fixHtmlCodeBlocks(filePath: string) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const newLines: string[] = [];
  let modified = false;

  lines.forEach((line, index) => {
    // Check for code-block div elements at odd line numbers
    if (line.trim().includes('code-block') && (newLines.length + 1) % 2 !== 0) {
      // Add a blank line to make the code block start at an even line
      newLines.push('');
      modified = true;
    }
    
    newLines.push(line);
  });

  if (modified) {
    writeFileSync(filePath, newLines.join('\n'));
    console.log(`✅ Fixed ${filePath}`);
  } else {
    console.log(`⏭️ No changes needed for ${filePath}`);
  }
}

// Fix the bun-features-explorer.html file
fixHtmlCodeBlocks('/Users/nolarose/ff/dashboard-worker/docs/bun-features-explorer.html');