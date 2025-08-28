#!/usr/bin/env bun

/**
 * Fire22 Directory Helper Utility (Bun-Native)
 * 
 * Helps diagnose and fix directory-related issues with proper error codes
 * Usage: bun run scripts/directory-helper.js [directory-path]
 */

import { existsSync, statSync, accessSync, readdirSync, mkdirSync, constants } from 'fs';
import { join, dirname } from 'path';

// Error codes from Fire22 registry
const ErrorCodes = {
    DIRECTORY_NOT_FOUND: 'E1003',
    PERMISSION_DENIED: 'E6001',
    PATH_INVALID: 'E1004'
};

class DirectoryHelper {
    constructor() {
        // Complete import.meta properties
        this.currentFile = import.meta.path;           // Absolute path to current file
        this.currentFilename = import.meta.filename;   // Alias for Node.js compat
        this.currentDir = import.meta.dir;            // Directory containing this file
        this.currentDirname = import.meta.dirname;    // Alias for Node.js compat
        this.scriptName = import.meta.file;           // Filename only
        this.scriptUrl = import.meta.url;             // file:// URL
        this.isMainEntry = import.meta.main;          // Direct execution detection
        this.environment = import.meta.env;           // Alias to process.env
        
        // Bun-specific utilities
        this.entrypoint = Bun.main;
        this.sessionId = Bun.randomUUIDv7(); // Unique session for error tracking
        
        // Initialize components
        this.errorRegistry = null;
        this.systemCommands = this.checkSystemCommands();
        this.moduleResolver = this.createModuleResolver();
    }

    /**
     * Create module resolver using import.meta.resolve
     */
    createModuleResolver() {
        return {
            resolve: (specifier) => {
                try {
                    return import.meta.resolve(specifier);
                } catch (error) {
                    console.warn(`⚠️ Could not resolve module: ${specifier}`);
                    return null;
                }
            },
            resolveMany: (specifiers) => {
                const results = {};
                for (const spec of specifiers) {
                    results[spec] = this.moduleResolver.resolve(spec);
                }
                return results;
            }
        };
    }

    async initializeErrorRegistry() {
        if (this.errorRegistry) return this.errorRegistry;
        
        try {
            // Use import.meta.dir instead of dirname for cleaner code
            const registryPath = join(this.currentDir, '../docs/error-codes.json');
            
            // Use Bun.file for optimized file reading
            const file = Bun.file(registryPath);
            const registryData = await file.text();
            this.errorRegistry = JSON.parse(registryData);
            return this.errorRegistry;
        } catch (error) {
            console.warn(`⚠️ Could not load error registry from ${this.scriptName}:`, error.message);
            this.errorRegistry = { errorCodes: {} };
            return this.errorRegistry;
        }
    }

    checkSystemCommands() {
        // Check for useful system commands using Bun.which()
        const commands = ['ls', 'mkdir', 'chmod', 'pwd', 'find', 'du', 'tree'];
        const available = {};
        
        for (const cmd of commands) {
            available[cmd] = Bun.which(cmd);
        }
        
        return available;
    }

    /**
     * Generate compressed diagnostic report using Bun compression
     */
    async generateDiagnosticReport(directoryPath, results) {
        const reportData = {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            directory: directoryPath,
            absolutePath: Bun.fileURLToPath(Bun.pathToFileURL(directoryPath)),
            results,
            systemCommands: this.systemCommands,
            runtime: {
                script: this.scriptName,
                location: this.currentFile,
                entrypoint: this.entrypoint,
                isMain: this.isMainEntry
            }
        };

        // Create detailed report with Bun.inspect for perfect formatting
        const reportText = Bun.inspect(reportData, { 
            depth: 10, 
            colors: false, 
            sorted: true 
        });

        // Compress report using Bun's native compression
        const buffer = Buffer.from(reportText, 'utf-8');
        const compressed = Bun.gzipSync(buffer, { level: 6 });
        
        console.log(`📋 Diagnostic Report Generated:`);
        console.log(`   📊 Original Size: ${buffer.length} bytes`);
        console.log(`   🗜️ Compressed: ${compressed.length} bytes`);
        console.log(`   💾 Compression Ratio: ${(((buffer.length - compressed.length) / buffer.length) * 100).toFixed(1)}%`);

        return {
            original: reportText,
            compressed,
            stats: {
                originalSize: buffer.length,
                compressedSize: compressed.length,
                ratio: ((buffer.length - compressed.length) / buffer.length) * 100
            }
        };
    }

    /**
     * Advanced directory analysis with file URL conversion
     */
    async analyzeDirectoryStructure(directoryPath) {
        if (!existsSync(directoryPath)) return null;

        try {
            const fileUrl = Bun.pathToFileURL(directoryPath);
            const absolutePath = Bun.fileURLToPath(fileUrl);
            
            const contents = readdirSync(directoryPath);
            const analysis = {
                path: directoryPath,
                absolutePath,
                fileUrl: fileUrl.toString(),
                items: [],
                summary: {
                    totalItems: contents.length,
                    directories: 0,
                    files: 0,
                    size: 0
                }
            };

            for (const item of contents) {
                const itemPath = join(directoryPath, item);
                const stats = statSync(itemPath);
                const itemUrl = Bun.pathToFileURL(itemPath);
                
                const itemData = {
                    name: item,
                    path: itemPath,
                    url: itemUrl.toString(),
                    type: stats.isDirectory() ? 'directory' : 'file',
                    size: stats.size,
                    modified: stats.mtime.toISOString(),
                    permissions: this.getPermissions(stats)
                };

                // Enhanced file analysis for non-directories
                if (!stats.isDirectory()) {
                    try {
                        // Use Bun.file() to get MIME type and additional file info
                        const bunFile = Bun.file(itemPath);
                        itemData.mimeType = bunFile.type || 'unknown';
                        
                        // Determine file category based on MIME type
                        itemData.category = this.categorizeFile(bunFile.type);
                        
                        // For text files, try to detect encoding
                        if (itemData.category === 'text' && stats.size < 1024 * 1024) { // Only for files < 1MB
                            try {
                                const bytes = await bunFile.bytes();
                                itemData.encoding = this.detectEncoding(bytes);
                                itemData.isBinary = false;
                            } catch {
                                itemData.isBinary = true;
                            }
                        } else {
                            itemData.isBinary = itemData.category !== 'text';
                        }
                        
                    } catch (error) {
                        // Fallback for files that can't be analyzed
                        itemData.mimeType = 'unknown';
                        itemData.category = 'unknown';
                        itemData.isBinary = true;
                    }
                }

                analysis.items.push(itemData);
                
                if (stats.isDirectory()) {
                    analysis.summary.directories++;
                } else {
                    analysis.summary.files++;
                    analysis.summary.size += stats.size;
                }
            }

            return analysis;
        } catch (error) {
            console.warn(`⚠️ Failed to analyze directory structure:`, error.message);
            return null;
        }
    }

    /**
     * Diagnose directory issues and provide solutions
     */
    async diagnoseDirectory(directoryPath) {
        console.log(`🔍 Diagnosing directory: ${directoryPath}`);
        console.log(`🆔 Session: ${this.sessionId}`);
        console.log('=' .repeat(60));
        
        // Initialize error registry if needed
        await this.initializeErrorRegistry();

        const results = {
            path: directoryPath,
            exists: false,
            accessible: false,
            permissions: null,
            errors: [],
            solutions: []
        };

        try {
            // Check if path exists
            if (!existsSync(directoryPath)) {
                results.errors.push({
                    code: ErrorCodes.DIRECTORY_NOT_FOUND,
                    message: 'Directory does not exist',
                    path: directoryPath
                });
                
                await this.logError(ErrorCodes.DIRECTORY_NOT_FOUND, directoryPath);
                results.solutions.push(...await this.getSolutions(ErrorCodes.DIRECTORY_NOT_FOUND));
                return results;
            }

            results.exists = true;

            // Check if it's actually a directory
            const stats = statSync(directoryPath);
            if (!stats.isDirectory()) {
                results.errors.push({
                    code: ErrorCodes.PATH_INVALID,
                    message: 'Path exists but is not a directory',
                    path: directoryPath
                });
                return results;
            }

            // Check permissions
            try {
                accessSync(directoryPath, constants.R_OK);
                results.accessible = true;
                results.permissions = this.getPermissions(stats);
                
                console.log(`✅ Directory exists and is accessible`);
                console.log(`📊 Permissions: ${results.permissions}`);
                
                // Enhanced directory analysis
                const analysis = await this.analyzeDirectoryStructure(directoryPath);
                if (analysis) {
                    console.log(`📁 Directory Analysis:`);
                    console.log(`   📍 Absolute Path: ${analysis.absolutePath}`);
                    console.log(`   🔗 File URL: ${analysis.fileUrl}`);
                    
                    // Use Bun.inspect.table for beautiful tabular display
                    console.log(`\n📋 Contents Summary:`);
                    const summaryTable = [
                        { Type: 'Files', Count: analysis.summary.files, Size: `${analysis.summary.size} bytes` },
                        { Type: 'Directories', Count: analysis.summary.directories, Size: 'N/A' },
                        { Type: 'Total Items', Count: analysis.summary.totalItems, Size: `${analysis.summary.size} bytes` }
                    ];
                    
                    // Display as formatted table using Bun.inspect
                    console.log(Bun.inspect(summaryTable, { 
                        colors: true, 
                        compact: false,
                        breakLength: 120 
                    }));
                    
                    // Show first 10 items with enhanced details
                    if (analysis.items.length > 0) {
                        console.log(`\n📄 Items (showing first ${Math.min(10, analysis.items.length)}):`);
                        analysis.items.slice(0, 10).forEach(item => {
                            const icon = item.type === 'directory' ? '📁' : '📄';
                            const sizeInfo = item.type === 'file' ? ` (${item.size} bytes)` : '';
                            console.log(`   ${icon} ${item.name}${sizeInfo}`);
                        });
                        
                        if (analysis.items.length > 10) {
                            console.log(`   ... and ${analysis.items.length - 10} more items`);
                        }
                    }
                } else {
                    // Fallback to simple listing
                    const contents = readdirSync(directoryPath);
                    console.log(`📁 Contents (${contents.length} items):`);
                    contents.slice(0, 10).forEach(item => {
                        const itemPath = join(directoryPath, item);
                        const itemStats = statSync(itemPath);
                        const type = itemStats.isDirectory() ? '📁' : '📄';
                        console.log(`   ${type} ${item}`);
                    });
                }

            } catch (error) {
                results.errors.push({
                    code: ErrorCodes.PERMISSION_DENIED,
                    message: 'Directory exists but cannot be accessed',
                    path: directoryPath,
                    error: error.message
                });
                
                await this.logError(ErrorCodes.PERMISSION_DENIED, directoryPath);
                results.solutions.push(...await this.getSolutions(ErrorCodes.PERMISSION_DENIED));
            }

        } catch (error) {
            results.errors.push({
                code: 'E1000',
                message: 'Unexpected error during directory diagnosis',
                path: directoryPath,
                error: error.message
            });
        }

        return results;
    }

    /**
     * Get solutions for specific error code
     */
    async getSolutions(errorCode) {
        await this.initializeErrorRegistry();
        const errorData = this.errorRegistry.errorCodes?.[errorCode];
        if (!errorData) {
            return ['Check error registry for detailed solutions'];
        }
        return errorData.solutions || [];
    }

    /**
     * Open file in editor for debugging (Bun-native)
     */
    async openInEditor(filePath, line = 1, column = 1) {
        try {
            console.log(`🔧 Opening ${filePath} in editor...`);
            await Bun.openInEditor(filePath, { line, column });
            return true;
        } catch (error) {
            console.warn(`⚠️ Could not open file in editor:`, error.message);
            return false;
        }
    }

    /**
     * Enhanced system command checker with suggestions
     */
    getSystemCommandSuggestions(directoryPath) {
        const suggestions = [];
        
        if (this.systemCommands.ls) {
            suggestions.push(`${this.systemCommands.ls} -la "${directoryPath}"`);
        }
        
        if (this.systemCommands.mkdir) {
            suggestions.push(`${this.systemCommands.mkdir} -p "${directoryPath}"`);
        }
        
        if (this.systemCommands.chmod) {
            suggestions.push(`${this.systemCommands.chmod} 755 "${directoryPath}"`);
        }
        
        if (this.systemCommands.find) {
            const parentDir = dirname(directoryPath);
            suggestions.push(`${this.systemCommands.find} "${parentDir}" -name "*" -type d`);
        }
        
        return suggestions;
    }

    /**
     * Categorize file based on MIME type
     */
    categorizeFile(mimeType) {
        if (!mimeType) return 'unknown';
        
        const mimeCategories = {
            text: ['text/', 'application/json', 'application/xml', 'application/javascript'],
            image: ['image/'],
            video: ['video/'],
            audio: ['audio/'],
            archive: ['application/zip', 'application/gzip', 'application/x-tar'],
            document: ['application/pdf', 'application/msword'],
            code: ['application/javascript', 'text/html', 'text/css']
        };

        for (const [category, patterns] of Object.entries(mimeCategories)) {
            if (patterns.some(pattern => mimeType.startsWith(pattern))) {
                return category;
            }
        }

        return 'unknown';
    }

    /**
     * Basic encoding detection for text files
     */
    detectEncoding(bytes) {
        // Simple UTF-8 BOM detection
        if (bytes.length >= 3 && 
            bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
            return 'utf-8-bom';
        }

        // UTF-16 BOM detection
        if (bytes.length >= 2) {
            if (bytes[0] === 0xFF && bytes[1] === 0xFE) return 'utf-16le';
            if (bytes[0] === 0xFE && bytes[1] === 0xFF) return 'utf-16be';
        }

        // Basic ASCII/UTF-8 heuristic
        let asciiCount = 0;
        let utf8Count = 0;
        
        for (let i = 0; i < Math.min(bytes.length, 1000); i++) {
            const byte = bytes[i];
            if (byte < 128) {
                asciiCount++;
            } else if (byte >= 194 && byte <= 244) {
                utf8Count++;
            }
        }

        const total = Math.min(bytes.length, 1000);
        if (asciiCount / total > 0.95) return 'ascii';
        if (utf8Count > 0) return 'utf-8';
        
        return 'unknown';
    }

    /**
     * Enhanced formatting with Bun.stringWidth for perfect alignment
     */
    formatAlignedText(label, value, width = 60) {
        const labelWidth = Bun.stringWidth(label);
        const padding = width - labelWidth;
        return `${label}${' '.repeat(Math.max(1, padding))} ${value}`;
    }

    /**
     * Sanitize text for terminal output  
     */
    sanitizeForTerminal(text) {
        // Use Bun.escapeHTML for safety, but convert back HTML entities for terminal
        const escaped = Bun.escapeHTML(text);
        return escaped
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
    }

    /**
     * Log error with perfect formatting using Bun utilities
     */
    async logError(errorCode, directoryPath) {
        await this.initializeErrorRegistry();
        const errorData = this.errorRegistry.errorCodes?.[errorCode];
        const errorName = errorData?.name || 'UNKNOWN_ERROR';
        const errorMessage = errorData?.message || 'Unknown error occurred';
        const errorId = Bun.randomUUIDv7('base64url'); // Short error ID

        // Enhanced formatting with string width calculation
        console.log(`🚨 Error ${errorCode} (${errorName}) [${errorId}]:`);
        console.log(this.formatAlignedText('   Message:', this.sanitizeForTerminal(errorMessage)));
        console.log(this.formatAlignedText('   Path:', directoryPath));
        console.log(this.formatAlignedText('   Session:', this.sessionId));
        console.log(this.formatAlignedText('   Timestamp:', new Date().toISOString()));
        
        if (errorData?.causes) {
            console.log(`\n   🔍 Possible Causes:`);
            errorData.causes.forEach((cause, index) => {
                const bullet = `     ${index + 1}.`;
                console.log(this.formatAlignedText(bullet, this.sanitizeForTerminal(cause), 50));
            });
        }

        if (errorData?.solutions) {
            console.log(`\n   💡 Solutions:`);
            errorData.solutions.forEach((solution, index) => {
                const bullet = `     ✓`;
                console.log(this.formatAlignedText(bullet, this.sanitizeForTerminal(solution), 50));
            });
        }

        // Add system command suggestions with perfect alignment
        const cmdSuggestions = this.getSystemCommandSuggestions(directoryPath);
        if (cmdSuggestions.length > 0) {
            console.log(`\n   🔧 System Commands:`);
            cmdSuggestions.forEach(cmd => {
                console.log(`     $ ${cmd}`);
            });
        }

        // Offer to open in editor for debugging
        if (existsSync(directoryPath)) {
            console.log(`\n   🔍 Debug: Run 'Bun.openInEditor("${directoryPath}")' to inspect`);
        }

        return errorId;
    }

    /**
     * Get human-readable permissions
     */
    getPermissions(stats) {
        const mode = stats.mode;
        const perms = {
            owner: {
                read: !!(mode & 0o400),
                write: !!(mode & 0o200),
                execute: !!(mode & 0o100)
            },
            group: {
                read: !!(mode & 0o040),
                write: !!(mode & 0o020),
                execute: !!(mode & 0o010)
            },
            others: {
                read: !!(mode & 0o004),
                write: !!(mode & 0o002),
                execute: !!(mode & 0o001)
            }
        };

        const formatPerms = (p) => `${p.read ? 'r' : '-'}${p.write ? 'w' : '-'}${p.execute ? 'x' : '-'}`;
        
        return `${formatPerms(perms.owner)}${formatPerms(perms.group)}${formatPerms(perms.others)} (${(mode & 0o777).toString(8)})`;
    }

    /**
     * Create directory with proper error handling
     */
    async createDirectory(directoryPath, options = { recursive: true }) {
        try {
            console.log(`📁 Creating directory: ${directoryPath}`);
            
            if (existsSync(directoryPath)) {
                console.log(`✅ Directory already exists: ${directoryPath}`);
                return true;
            }

            if (options.recursive) {
                mkdirSync(directoryPath, { recursive: true });
            } else {
                mkdirSync(directoryPath);
            }

            console.log(`✅ Successfully created directory: ${directoryPath}`);
            return true;

        } catch (error) {
            console.error(`🚨 Failed to create directory ${directoryPath}:`, error.message);
            await this.logError(ErrorCodes.PERMISSION_DENIED, directoryPath);
            return false;
        }
    }

    /**
     * Fix common directory issues
     */
    async autoFix(directoryPath) {
        console.log(`🔧 Auto-fixing directory issues for: ${directoryPath}`);
        console.log('=' .repeat(50));

        const diagnosis = await this.diagnoseDirectory(directoryPath);

        if (!diagnosis.exists) {
            console.log(`💡 Directory doesn't exist. Creating it...`);
            const created = await this.createDirectory(directoryPath);
            
            if (created) {
                console.log(`✅ Auto-fix successful: Directory created`);
                return await this.diagnoseDirectory(directoryPath);
            } else {
                console.log(`❌ Auto-fix failed: Could not create directory`);
                return diagnosis;
            }
        }

        if (!diagnosis.accessible) {
            console.log(`💡 Directory exists but isn't accessible`);
            console.log(`   Manual intervention required for permissions`);
            console.log(`   Try: chmod 755 "${directoryPath}"`);
        }

        return diagnosis;
    }

    /**
     * Generate and optionally save diagnostic report
     */
    async generateReport(directoryPath, saveToFile = false) {
        console.log(`📋 Generating comprehensive diagnostic report for: ${directoryPath}`);
        console.log('=' .repeat(70));

        const diagnosis = await this.diagnoseDirectory(directoryPath);
        const report = await this.generateDiagnosticReport(directoryPath, diagnosis);

        if (saveToFile) {
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const reportFileName = `diagnostic-report-${timestamp}.txt`;
                const compressedFileName = `diagnostic-report-${timestamp}.gz`;

                // Save original report
                await Bun.write(reportFileName, report.original);
                
                // Save compressed report
                await Bun.write(compressedFileName, report.compressed);

                console.log(`\n💾 Reports saved:`);
                console.log(`   📄 Original: ${reportFileName}`);
                console.log(`   🗜️ Compressed: ${compressedFileName}`);
                console.log(`   💾 Space saved: ${report.stats.ratio.toFixed(1)}%`);

                // Offer to open in editor
                console.log(`\n🔧 Open report: bun run scripts/directory-helper.js open-report ${reportFileName}`);

            } catch (error) {
                console.error(`❌ Failed to save report:`, error.message);
            }
        }

        return report;
    }

    /**
     * Open report file in editor
     */
    async openReport(reportPath) {
        if (!existsSync(reportPath)) {
            console.error(`❌ Report file not found: ${reportPath}`);
            return false;
        }

        try {
            console.log(`🔧 Opening report in editor: ${reportPath}`);
            await this.openInEditor(reportPath);
            return true;
        } catch (error) {
            console.error(`❌ Failed to open report:`, error.message);
            return false;
        }
    }

    /**
     * Analyze project dependencies and module resolution
     */
    async analyzeDependencies() {
        console.log(`📦 Analyzing Project Dependencies and Module Resolution`);
        console.log('=' .repeat(70));
        
        // Core modules to test resolution
        const coreModules = ['fs', 'path', 'url', 'crypto'];
        const projectModules = ['bun', 'itty-router'];
        
        console.log(`\n📍 Project Context:`);
        console.log(`   Working Directory: ${process.cwd()}`);
        console.log(`   Script Directory: ${this.currentDir}`);
        console.log(`   Script URL: ${this.scriptUrl}`);
        
        console.log(`\n🔧 Core Module Resolution:`);
        for (const module of coreModules) {
            const resolved = this.moduleResolver.resolve(module);
            if (resolved) {
                console.log(`   ✅ ${module} → ${resolved}`);
            } else {
                console.log(`   ❌ ${module} → Not found`);
            }
        }
        
        console.log(`\n📦 Project Module Resolution:`);
        for (const module of projectModules) {
            const resolved = this.moduleResolver.resolve(module);
            if (resolved) {
                const relative = resolved.replace(process.cwd(), '.');
                console.log(`   ✅ ${module} → ${relative}`);
            } else {
                console.log(`   ❌ ${module} → Not found`);
            }
        }
        
        // Try to analyze package.json
        try {
            const packageJsonPath = join(process.cwd(), 'package.json');
            const packageFile = Bun.file(packageJsonPath);
            const packageData = await packageFile.json();
            
            console.log(`\n📋 Package.json Analysis:`);
            console.log(`   Name: ${packageData.name || 'N/A'}`);
            console.log(`   Version: ${packageData.version || 'N/A'}`);
            console.log(`   Dependencies: ${Object.keys(packageData.dependencies || {}).length}`);
            console.log(`   Dev Dependencies: ${Object.keys(packageData.devDependencies || {}).length}`);
            
            if (packageData.dependencies) {
                console.log(`\n🔗 Dependency Resolution (top 10):`);
                const deps = Object.keys(packageData.dependencies).slice(0, 10);
                for (const dep of deps) {
                    const resolved = this.moduleResolver.resolve(dep);
                    if (resolved) {
                        const relative = resolved.replace(process.cwd(), '.');
                        console.log(`   ${dep}@${packageData.dependencies[dep]} → ${relative}`);
                    }
                }
            }
        } catch (error) {
            console.warn(`⚠️ Could not analyze package.json:`, error.message);
        }
        
        return true;
    }

    /**
     * Show help information
     */
    showHelp() {
        console.log(`
🏢 Fire22 Directory Helper Utility (Bun-Native)

Usage:
  bun run scripts/directory-helper.js [command] [path]

Commands:
  diagnose <path>    - Diagnose directory issues with detailed analysis
  create <path>      - Create directory if it doesn't exist  
  autofix <path>     - Automatically fix common directory issues
  report <path>      - Generate comprehensive diagnostic report
  report <path> --save - Save diagnostic report to compressed files
  open-report <file> - Open report file in default editor
  deps              - Analyze dependencies and module resolution
  help              - Show this help message

Examples:
  bun run scripts/directory-helper.js diagnose src/departments
  bun run scripts/directory-helper.js create src/new-department
  bun run scripts/directory-helper.js autofix src/departments
  bun run scripts/directory-helper.js report src/departments --save
  bun run scripts/directory-helper.js open-report diagnostic-report-2025-08-28.txt

Bun Features:
  ✅ Native TypeScript execution
  ✅ Optimized file I/O with Bun.file() & Bun.write()
  ✅ Fast directory operations with file URL conversion
  ✅ UUID-based error tracking (Bun.randomUUIDv7)
  ✅ System command detection (Bun.which)
  ✅ Editor integration (Bun.openInEditor)
  ✅ Better entry point detection (import.meta.path === Bun.main)
  ✅ Native compression (Bun.gzipSync) for diagnostic reports
  ✅ Advanced object inspection (Bun.inspect) with tables
  ✅ URL/Path conversion (Bun.pathToFileURL, Bun.fileURLToPath)

Error Codes:
  E1003 - DIRECTORY_NOT_FOUND (System error - directory missing)
  E6001 - PERMISSION_DENIED (Security error - access restricted)  
  E1004 - PATH_INVALID (System error - invalid path format)

System Commands Available:
  📍 ls: ${this.systemCommands.ls || 'Not found'}
  📁 mkdir: ${this.systemCommands.mkdir || 'Not found'}
  🔐 chmod: ${this.systemCommands.chmod || 'Not found'}
  📂 pwd: ${this.systemCommands.pwd || 'Not found'}
  🔍 find: ${this.systemCommands.find || 'Not found'}

Runtime Information:
  🆔 Session: ${this.sessionId}
  📄 Script: ${this.scriptName} (import.meta.file)
  📁 Script Dir: ${this.currentDir} (import.meta.dir)  
  📍 Full Path: ${this.currentFile} (import.meta.path)
  🔗 File URL: ${this.scriptUrl} (import.meta.url)
  🚀 Entrypoint: ${this.entrypoint} (Bun.main)
  ⚡ Is Main: ${this.isMainEntry ? 'Yes' : 'No'} (import.meta.main)
  🌍 Environment: ${Object.keys(this.environment).length} variables available
  🕒 Started: ${new Date().toISOString()}

Enhanced Features:
  • Unique error tracking with base64url IDs
  • System command suggestions for fixes
  • Editor integration for debugging paths
  • Session-based error correlation
  • Advanced Bun utility integration

For detailed error information, see: docs/error-codes.json
        `);
    }
}

// CLI Interface
async function main() {
    const helper = new DirectoryHelper();
    // Use Bun.argv for command line arguments (same as process.argv but more explicit)
    const args = Bun.argv.slice(2);

    if (args.length === 0) {
        helper.showHelp();
        return;
    }

    const command = args[0].toLowerCase();
    const directoryPath = args[1];

    switch (command) {
        case 'diagnose':
            if (!directoryPath) {
                console.error('❌ Please provide a directory path to diagnose');
                process.exit(1);
            }
            await helper.diagnoseDirectory(directoryPath);
            break;

        case 'create':
            if (!directoryPath) {
                console.error('❌ Please provide a directory path to create');
                process.exit(1);
            }
            await helper.createDirectory(directoryPath);
            break;

        case 'autofix':
            if (!directoryPath) {
                console.error('❌ Please provide a directory path to auto-fix');
                process.exit(1);
            }
            await helper.autoFix(directoryPath);
            break;

        case 'report':
            if (!directoryPath) {
                console.error('❌ Please provide a directory path for report generation');
                process.exit(1);
            }
            const saveReport = args.includes('--save');
            await helper.generateReport(directoryPath, saveReport);
            break;

        case 'open-report':
            if (!directoryPath) {
                console.error('❌ Please provide a report file path to open');
                process.exit(1);
            }
            await helper.openReport(directoryPath);
            break;

        case 'deps':
        case 'dependencies':
            await helper.analyzeDependencies();
            break;

        case 'help':
        case '--help':
        case '-h':
            helper.showHelp();
            break;

        default:
            // If no command specified, treat first arg as path to diagnose
            if (command && !directoryPath) {
                await helper.diagnoseDirectory(command);
            } else {
                console.error(`❌ Unknown command: ${command}`);
                helper.showHelp();
                process.exit(1);
            }
            break;
    }
}

// Run if called directly (using Bun's import.meta.main)
if (import.meta.main) {
    main().catch(error => {
        console.error('🚨 Unexpected error:', error.message);
        console.error('📍 Error occurred in:', import.meta.path);
        process.exit(1);
    });
}

export default DirectoryHelper;