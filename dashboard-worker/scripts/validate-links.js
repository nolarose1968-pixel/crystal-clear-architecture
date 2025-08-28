#!/usr/bin/env bun
/**
 * 🔗 Fire22 Dashboard - Link Validation Tool
 * Validates all internal links in documentation files
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';

const BASE_URL = 'http://localhost:4000';
const DOCS_DIR = './docs';
const SRC_DIR = './src';

// Patterns to check
const LINK_PATTERNS = [
  /href=["']([^"']+)["']/g,
  /src=["']([^"']+)["']/g,
  /url\(["']?([^"')]+)["']?\)/g
];

// Ignore patterns
const IGNORE_PATTERNS = [
  /^https?:\/\//, // External URLs
  /^mailto:/, // Email links
  /^tel:/, // Phone links
  /^#/, // Anchor links
  /^javascript:/, // JavaScript links
  /^\w+:/, // Other protocols
];

class LinkValidator {
  constructor() {
    this.results = {
      total: 0,
      valid: 0,
      broken: 0,
      warnings: 0,
      files: {}
    };
  }

  async validateFile(filePath) {
    try {
      const content = await readFile(filePath, 'utf-8');
      const fileName = filePath.replace('./docs/', '');
      
      this.results.files[fileName] = {
        links: [],
        broken: [],
        warnings: []
      };

      // Extract all links
      const links = new Set();
      
      for (const pattern of LINK_PATTERNS) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const url = match[1];
          if (!this.shouldIgnore(url)) {
            links.add(url);
          }
        }
      }

      // Validate each link
      for (const link of links) {
        this.results.total++;
        const validation = await this.validateLink(link, filePath);
        
        this.results.files[fileName].links.push({
          url: link,
          status: validation.status,
          message: validation.message
        });

        if (validation.status === 'valid') {
          this.results.valid++;
        } else if (validation.status === 'broken') {
          this.results.broken++;
          this.results.files[fileName].broken.push(link);
        } else if (validation.status === 'warning') {
          this.results.warnings++;
          this.results.files[fileName].warnings.push(link);
        }
      }

    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }

  shouldIgnore(url) {
    return IGNORE_PATTERNS.some(pattern => pattern.test(url));
  }

  async validateLink(url, fromFile) {
    try {
      // Handle relative paths
      if (url.startsWith('./') || url.startsWith('../')) {
        return this.validateRelativePath(url, fromFile);
      }

      // Handle absolute paths
      if (url.startsWith('/')) {
        return this.validateAbsolutePath(url);
      }

      // Handle other cases
      return { status: 'warning', message: 'Unhandled URL format' };

    } catch (error) {
      return { status: 'broken', message: error.message };
    }
  }

  validateRelativePath(url, fromFile) {
    const basePath = fromFile.replace(/\/[^\/]+$/, '');
    let resolvedPath;

    if (url.startsWith('./')) {
      resolvedPath = join(basePath, url.substring(2));
    } else if (url.startsWith('../')) {
      resolvedPath = join(basePath, url);
    }

    if (existsSync(resolvedPath)) {
      return { status: 'valid', message: 'File exists' };
    } else {
      return { status: 'broken', message: `File not found: ${resolvedPath}` };
    }
  }

  async validateAbsolutePath(url) {
    // Check if it's a docs path
    if (url.startsWith('/docs/')) {
      const filePath = `.${url}`;
      if (existsSync(filePath)) {
        return { status: 'valid', message: 'Documentation file exists' };
      } else {
        return { status: 'broken', message: `Documentation file not found: ${filePath}` };
      }
    }

    // Check if it's a styles path
    if (url.startsWith('/src/styles/')) {
      const filePath = `.${url}`;
      if (existsSync(filePath)) {
        return { status: 'valid', message: 'Style file exists' };
      } else {
        return { status: 'broken', message: `Style file not found: ${filePath}` };
      }
    }

    // Check if it's an API endpoint
    if (url.startsWith('/api/')) {
      try {
        const response = await fetch(`${BASE_URL}${url}`);
        if (response.ok) {
          return { status: 'valid', message: 'API endpoint accessible' };
        } else {
          return { status: 'broken', message: `API endpoint returned ${response.status}` };
        }
      } catch (error) {
        return { status: 'warning', message: 'Could not test API endpoint (server may be down)' };
      }
    }

    return { status: 'warning', message: 'Unknown absolute path format' };
  }

  async scanDirectory(dir) {
    const entries = await readdir(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (extname(entry) === '.html') {
        await this.validateFile(fullPath);
      }
    }
  }

  generateReport() {
    console.log('\n🔗 Fire22 Link Validation Report');
    console.log('================================');
    console.log(`📊 Total Links: ${this.results.total}`);
    console.log(`✅ Valid: ${this.results.valid}`);
    console.log(`❌ Broken: ${this.results.broken}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    
    const successRate = ((this.results.valid / this.results.total) * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);

    if (this.results.broken > 0) {
      console.log('\n❌ Broken Links:');
      for (const [file, data] of Object.entries(this.results.files)) {
        if (data.broken.length > 0) {
          console.log(`\n📄 ${file}:`);
          data.broken.forEach(link => console.log(`  - ${link}`));
        }
      }
    }

    if (this.results.warnings > 0) {
      console.log('\n⚠️  Warnings:');
      for (const [file, data] of Object.entries(this.results.files)) {
        if (data.warnings.length > 0) {
          console.log(`\n📄 ${file}:`);
          data.warnings.forEach(link => console.log(`  - ${link}`));
        }
      }
    }

    return this.results;
  }
}

// Main execution
async function main() {
  console.log('🔍 Starting link validation...');
  
  const validator = new LinkValidator();
  
  try {
    await validator.scanDirectory(DOCS_DIR);
    const results = validator.generateReport();
    
    // Exit with error code if there are broken links
    if (results.broken > 0) {
      console.log('\n💥 Validation failed due to broken links!');
      process.exit(1);
    } else {
      console.log('\n✅ All links validated successfully!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}

export default LinkValidator;
