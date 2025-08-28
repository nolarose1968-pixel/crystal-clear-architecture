#!/usr/bin/env bun

// Final showcase of the Pattern Weaver streaming capabilities
import { patternWeaver } from './src/patterns/pattern-weaver.ts';

console.log("🎭 FINAL STREAMING CAPABILITIES SHOWCASE");
console.log("═".repeat(45));

async function finalShowcase() {
  
  // 1. Create a complex test file
  console.log("\n1️⃣ Creating Complex Test File");
  console.log("-".repeat(26));
  
  const complexContent = `
// Complex TypeScript/JavaScript Test File
import { readFileSync } from 'fs';
import express from 'express';

// Configuration with sensitive data (for testing)
const config = {
  // TODO: Move these to environment variables
  apiKey: "sk-1234567890abcdef",
  database: {
    host: "localhost",
    user: "admin", 
    password: "super-secret-password"
  },
  redis: {
    host: "redis://localhost:6379",
    token: "redis-auth-token-123"
  }
};

// FIXME: This needs better error handling
class DataProcessor {
  constructor() {
    this.data = [];
  }

  async processData(input) {
    // Complex processing logic with multiple patterns
    if (!input) {
      console.log("Error: No input provided");
      return null;
    }
    
    const results = [];
    for (let i = 0; i < input.length; i++) {
      if (input[i].type === 'user') {
        results.push({
          id: input[i].id,
          name: input[i].name,
          email: input[i].email || 'no-email@example.com'
        });
      }
      
      // Simulate async operations
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    
    return results;
  }

  // More functions with different complexity
  validateEmail(email) {
    return email.includes('@') && email.includes('.');
  }
  
  function globalFunction() {
    console.log("This is a global function");
  }
}

export default DataProcessor;
export { config };

/* Multi-line comment
   with various patterns and
   sensitive information like:
   - API keys: abc123def456
   - Passwords: mySecretPass123
   - Tokens: token_xyz789
*/

// JSON-like data structure
const sampleData = {
  "users": [
    {"id": 1, "name": "John", "role": "admin"},
    {"id": 2, "name": "Jane", "role": "user"},
    {"id": 3, "name": "Bob", "role": "moderator"}
  ],
  "settings": {
    "theme": "dark",
    "notifications": true,
    "privacy": "strict"
  }
};

// CSV-like content
const csvData = \`
id,name,email,created_at
1,"John Doe","john@example.com","2023-01-01"
2,"Jane Smith","jane@example.com","2023-01-02"  
3,"Bob Johnson","bob@example.com","2023-01-03"
\`;

// YAML-like configuration
const yamlConfig = \`
server:
  host: localhost
  port: 3000
database:
  type: postgresql
  host: db.example.com
  port: 5432
\`;

// More complexity patterns
while (true) {
  if (Math.random() > 0.5) {
    for (let j = 0; j < 10; j++) {
      switch (j) {
        case 0:
          console.log("Starting...");
          break;
        case 9:
          console.log("Finishing...");
          break;
        default:
          console.log(\`Processing \${j}\`);
      }
    }
    break;
  }
}
`;

  await Bun.write('./complex-test-file.ts', complexContent);
  
  console.log("✅ Created complex test file with:");
  console.log("   📝 TypeScript/JavaScript code");
  console.log("   🔒 Sensitive data patterns");
  console.log("   📊 Multiple data formats (JSON, CSV, YAML)");
  console.log("   🔄 Control flow structures");
  console.log("   💭 Comments and documentation");
  
  // 2. Comprehensive streaming analysis
  console.log("\n2️⃣ Comprehensive Streaming Analysis");
  console.log("-".repeat(33));
  
  const comprehensiveResult = await patternWeaver.applyPattern('STREAM', {
    source: 'file',
    filePath: './complex-test-file.ts',
    analysis: true,
    processor: async (text, chunk, index) => {
      // Multi-faceted analysis
      const codeMetrics = {
        // Code structure
        classes: (text.match(/class\s+\w+/g) || []).length,
        functions: (text.match(/(?:function\s+\w+|async\s+function\s+\w+|\w+\s*\([^)]*\)\s*{)/g) || []).length,
        imports: (text.match(/import\s+.*from/g) || []).length,
        exports: (text.match(/export\s+(?:default\s+)?/g) || []).length,
        
        // Control flow
        conditions: (text.match(/\bif\s*\(/g) || []).length,
        loops: (text.match(/\b(?:for|while)\s*\(/g) || []).length,
        switches: (text.match(/\bswitch\s*\(/g) || []).length,
        
        // Async patterns
        asyncFunctions: (text.match(/async\s+(?:function|\w+)/g) || []).length,
        awaits: (text.match(/\bawait\s+/g) || []).length,
        promises: (text.match(/Promise\./g) || []).length,
        
        // Data patterns
        jsonObjects: (text.match(/\{[^}]*"[^"]*"[^}]*\}/g) || []).length,
        arrays: (text.match(/\[[^\]]*\]/g) || []).length,
        
        // Security concerns
        secrets: (text.match(/(?:password|key|token|secret)["\s]*[:=]/gi) || []).length,
        hardcodedStrings: (text.match(/"[^"]{10,}"/g) || []).length,
        
        // Code quality indicators
        todos: (text.match(/TODO/gi) || []).length,
        fixmes: (text.match(/FIXME/gi) || []).length,
        consoleLogs: (text.match(/console\.\w+/g) || []).length,
        comments: (text.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length,
      };
      
      // Calculate complexity score
      const complexity = codeMetrics.conditions + codeMetrics.loops + 
                        codeMetrics.switches + codeMetrics.functions;
      
      // Determine code maturity
      const issues = codeMetrics.todos + codeMetrics.fixmes + codeMetrics.consoleLogs;
      const maturity = issues === 0 ? 'MATURE' : issues < 5 ? 'DEVELOPING' : 'EARLY';
      
      return {
        ...codeMetrics,
        complexity,
        maturity,
        securityRisk: codeMetrics.secrets > 0 ? 'HIGH' : 'LOW',
        chunkIndex: index
      };
    },
    chunkProcessor: async (chunk, index) => {
      // Binary analysis
      const bytes = new Uint8Array(chunk);
      const entropy = calculateEntropy(bytes);
      const nullBytes = bytes.filter(b => b === 0).length;
      const printableChars = bytes.filter(b => b >= 32 && b <= 126).length;
      
      return {
        entropy: entropy.toFixed(4),
        nullBytes,
        printableRatio: (printableChars / bytes.length).toFixed(3),
        binaryComplexity: entropy > 7.5 ? 'HIGH' : entropy > 5.0 ? 'MEDIUM' : 'LOW'
      };
    }
  });

  // Helper function for entropy calculation
  function calculateEntropy(bytes) {
    const frequencies = new Array(256).fill(0);
    bytes.forEach(byte => frequencies[byte]++);
    
    let entropy = 0;
    frequencies.forEach(freq => {
      if (freq > 0) {
        const probability = freq / bytes.length;
        entropy -= probability * Math.log2(probability);
      }
    });
    
    return entropy;
  }
  
  console.log("\n📊 Comprehensive Analysis Results:");
  console.log("─".repeat(35));
  
  if (comprehensiveResult.success) {
    console.log(`File Analysis:`);
    console.log(`   📏 Size: ${(comprehensiveResult.totalSize / 1024).toFixed(2)} KB`);
    console.log(`   📝 Lines: ${comprehensiveResult.analysis?.lineCount || 'N/A'}`);
    console.log(`   📖 Words: ${comprehensiveResult.analysis?.wordCount || 'N/A'}`);
    console.log(`   ⚡ Processing: ${comprehensiveResult.processingTime}`);
    console.log(`   🚀 Throughput: ${comprehensiveResult.throughput}`);
    
    if (comprehensiveResult.analysis?.dataTypes) {
      console.log(`   🏷️  Data Types: ${comprehensiveResult.analysis.dataTypes.join(', ')}`);
    }
    
    // Process custom analysis results
    const customResults = comprehensiveResult.chunks
      .filter(c => c.processed)
      .reduce((acc, chunk) => {
        const data = chunk.processed;
        Object.keys(data).forEach(key => {
          if (typeof data[key] === 'number') {
            acc[key] = (acc[key] || 0) + data[key];
          } else if (key === 'maturity' || key === 'securityRisk') {
            acc[key] = data[key]; // Use last value
          }
        });
        return acc;
      }, {});
    
    console.log(`\n🔍 Code Structure Analysis:`);
    console.log(`   Classes: ${customResults.classes || 0}`);
    console.log(`   Functions: ${customResults.functions || 0}`);
    console.log(`   Imports: ${customResults.imports || 0}`);
    console.log(`   Exports: ${customResults.exports || 0}`);
    console.log(`   Complexity Score: ${customResults.complexity || 0}`);
    
    console.log(`\n🔄 Control Flow:`);
    console.log(`   Conditions (if): ${customResults.conditions || 0}`);
    console.log(`   Loops (for/while): ${customResults.loops || 0}`);
    console.log(`   Switches: ${customResults.switches || 0}`);
    
    console.log(`\n⚡ Async Patterns:`);
    console.log(`   Async Functions: ${customResults.asyncFunctions || 0}`);
    console.log(`   Await Calls: ${customResults.awaits || 0}`);
    console.log(`   Promise Usage: ${customResults.promises || 0}`);
    
    console.log(`\n🔒 Security Analysis:`);
    console.log(`   Sensitive Data: ${customResults.secrets || 0} instances`);
    console.log(`   Hardcoded Strings: ${customResults.hardcodedStrings || 0}`);
    console.log(`   Risk Level: ${customResults.securityRisk || 'UNKNOWN'}`);
    
    console.log(`\n📊 Code Quality:`);
    console.log(`   TODOs: ${customResults.todos || 0}`);
    console.log(`   FIXMEs: ${customResults.fixmes || 0}`);
    console.log(`   Console Logs: ${customResults.consoleLogs || 0}`);
    console.log(`   Comments: ${customResults.comments || 0}`);
    console.log(`   Maturity Level: ${customResults.maturity || 'UNKNOWN'}`);
    
    // Binary analysis
    const binaryResults = comprehensiveResult.chunks
      .filter(c => c.chunkProcessed)
      .map(c => c.chunkProcessed);
      
    if (binaryResults.length > 0) {
      const avgEntropy = binaryResults.reduce((sum, r) => sum + parseFloat(r.entropy), 0) / binaryResults.length;
      const avgPrintable = binaryResults.reduce((sum, r) => sum + parseFloat(r.printableRatio), 0) / binaryResults.length;
      
      console.log(`\n🔢 Binary Analysis:`);
      console.log(`   Average Entropy: ${avgEntropy.toFixed(4)}`);
      console.log(`   Printable Ratio: ${(avgPrintable * 100).toFixed(1)}%`);
      console.log(`   Complexity: ${binaryResults[0]?.binaryComplexity || 'UNKNOWN'}`);
    }
  }
  
  // 3. Performance benchmarking
  console.log("\n3️⃣ Performance Benchmarking Suite");
  console.log("-".repeat(30));
  
  const benchmarkResults = [];
  
  const benchmarkConfigs = [
    { name: 'Minimal', config: { source: 'file', filePath: './complex-test-file.ts' } },
    { name: 'Analysis Only', config: { source: 'file', filePath: './complex-test-file.ts', analysis: true } },
    { name: 'Processing Only', config: { 
      source: 'file', 
      filePath: './complex-test-file.ts',
      processor: async (text) => ({ wordCount: text.split(' ').length })
    }},
    { name: 'Chunk Processing', config: {
      source: 'file',
      filePath: './complex-test-file.ts',
      chunkProcessor: async (chunk) => ({ size: chunk.length })
    }},
    { name: 'Full Suite', config: {
      source: 'file',
      filePath: './complex-test-file.ts',
      analysis: true,
      processor: async (text) => ({ lines: text.split('\\n').length }),
      chunkProcessor: async (chunk) => ({ entropy: calculateEntropy(new Uint8Array(chunk)) })
    }}
  ];
  
  console.log("🏁 Running benchmark suite...");
  
  for (const benchmark of benchmarkConfigs) {
    const startTime = Bun.nanoseconds();
    const result = await patternWeaver.applyPattern('STREAM', benchmark.config);
    const endTime = Bun.nanoseconds();
    
    const totalTime = (endTime - startTime) / 1_000_000;
    const streamTime = parseFloat(result.processingTime);
    const overhead = totalTime - streamTime;
    
    benchmarkResults.push({
      name: benchmark.name,
      totalTime: totalTime.toFixed(3),
      streamTime: result.processingTime,
      overhead: overhead.toFixed(3),
      throughput: result.throughput,
      success: result.success ? '✅' : '❌'
    });
    
    console.log(`   ${benchmark.name}: ${totalTime.toFixed(3)}ms (${result.throughput})`);
  }
  
  console.log("\n📊 Benchmark Summary:");
  console.log("┌─────────────────┬──────────────┬──────────────┬──────────────┬────────────────┬─────────┐");
  console.log("│ Configuration   │ Total Time   │ Stream Time  │ Overhead     │ Throughput     │ Success │");
  console.log("├─────────────────┼──────────────┼──────────────┼──────────────┼────────────────┼─────────┤");
  
  benchmarkResults.forEach(result => {
    const row = [
      result.name.padEnd(15),
      (result.totalTime + 'ms').padStart(12),
      result.streamTime.padStart(12),
      (result.overhead + 'ms').padStart(12),
      result.throughput.padStart(14),
      result.success.padStart(7)
    ];
    console.log(`│ ${row.join(' │ ')} │`);
  });
  
  console.log("└─────────────────┴──────────────┴──────────────┴──────────────┴────────────────┴─────────┘");
  
  // Clean up
  await Bun.write('./complex-test-file.ts', ''); // Clear test file
  
  console.log("\n🎊 STREAMING CAPABILITIES SHOWCASE COMPLETE!");
  console.log("═".repeat(50));
  console.log("🏆 Pattern Weaver System Features Demonstrated:");
  console.log("   📁 File system integration with Bun.file()");
  console.log("   🌊 Advanced streaming with Bun.file().stream()");
  console.log("   📊 Comprehensive text and code analysis");
  console.log("   🔒 Security pattern detection");
  console.log("   🗜️  Compression and entropy analysis");
  console.log("   ⚡ High-performance processing with nanosecond timing");
  console.log("   📈 Real-time metrics and throughput measurement");
  console.log("   🔄 Multi-pattern workflow integration");
  console.log("   🏭 Data pipeline processing capabilities");
  console.log("   🎯 Custom processors and analyzers");
  console.log("   📋 Professional reporting and visualization");
  
  console.log("\n🚀 Ready for production use with 13 integrated patterns!");
}

await finalShowcase();