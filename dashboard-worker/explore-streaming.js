#!/usr/bin/env bun

// Import the pattern system
import patterns from './src/patterns/index.ts';
import PatternConnector from './src/patterns/pattern-connector.ts';

const { weaver: patternWeaver, examples: PatternExamples } = patterns;

console.log("🌊 EXPLORING FILE STREAMING CAPABILITIES");
console.log("═".repeat(50));

// Let's explore different streaming workflows

async function exploreFileStreaming() {
  try {
    // 1. Basic file streaming analysis
    console.log("\n1️⃣ Basic File Streaming Analysis");
    console.log("-".repeat(30));
    
    const streamingResult = await PatternExamples.fileStreamingWorkflow();
    
    // 2. Large file processing demo
    console.log("\n2️⃣ Large File Processing Demo");
    console.log("-".repeat(30));
    
    const largeFileResults = await PatternExamples.largeFileDemo();
    
    // 3. Performance comparison
    console.log("\n3️⃣ Stream Performance Testing");
    console.log("-".repeat(30));
    
    const perfResults = await PatternExamples.streamPerformanceTest();
    
    // 4. Multi-pattern workflow
    console.log("\n4️⃣ Multi-Pattern Streaming Workflow");
    console.log("-".repeat(35));
    
    const workflows = PatternConnector.defineWorkflows();
    const multiResult = await workflows.fileStreamingAnalysis('./src/patterns/pattern-weaver.ts');
    
    // 5. Cross-pattern pipeline
    console.log("\n5️⃣ Cross-Pattern Data Pipeline");
    console.log("-".repeat(30));
    
    const pipelineFiles = [
      './src/patterns/pattern-weaver.ts',
      './src/patterns/pattern-connector.ts',
      './src/patterns/shell-weaver.ts'
    ];
    
    const pipelineResult = await workflows.crossPatternDataPipeline(pipelineFiles, 'table');
    
    console.log("\n🎉 Exploration Complete!");
    console.log("═".repeat(25));
    console.log("✅ All streaming workflows demonstrated successfully");
    
  } catch (error) {
    console.error("❌ Error during exploration:", error.message);
  }
}

// Run the exploration
await exploreFileStreaming();