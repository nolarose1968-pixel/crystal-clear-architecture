#!/usr/bin/env bun

/**
 * Fire22 Enterprise - Bun Dependency Resolution Priority Demo
 * Demonstrates how Bun resolves conflicting dependency versions
 */

console.log("🔍 Fire22 Enterprise - Dependency Resolution Priority Demo");
console.log("========================================================");

async function demonstrateDependencyResolution() {
    console.log("\n📋 Bun Dependency Resolution Priority Order:");
    console.log("==========================================");
    console.log("1️⃣  devDependencies     (highest priority)");
    console.log("2️⃣  optionalDependencies");
    console.log("3️⃣  dependencies");
    console.log("4️⃣  peerDependencies    (lowest priority)");
    console.log("");

    // Show the demo package.json
    console.log("📦 Demo Package Configuration:");
    console.log("=============================");

    const demoConfig = {
        name: "fire22-dependency-resolution-demo",
        version: "1.0.0",
        description: "Demonstrating Bun's dependency resolution priority",
        dependencies: {
            "semver": "^7.3.0"
        },
        devDependencies: {
            "semver": "^7.6.0"
        },
        optionalDependencies: {
            "semver": "^7.4.0"
        },
        peerDependencies: {
            "semver": "^7.5.0"
        }
    };

    console.log("dependencies:        semver ^7.3.0");
    console.log("devDependencies:     semver ^7.6.0  ← HIGHEST PRIORITY");
    console.log("optionalDependencies: semver ^7.4.0");
    console.log("peerDependencies:    semver ^7.5.0");
    console.log("");

    console.log("🎯 Expected Resolution:");
    console.log("======================");
    console.log("✅ Bun will install: semver ^7.6.0 (from devDependencies)");
    console.log("💡 Reason: devDependencies has the highest priority");
    console.log("");

    // Demonstrate with current project
    console.log("🔍 Current Fire22 Project Analysis:");
    console.log("===================================");

    try {
        const deps = await runCommand("bun pm pkg get dependencies");
        const devDeps = await runCommand("bun pm pkg get devDependencies");
        const optionalDeps = await runCommand("bun pm pkg get optionalDependencies");
        const peerDeps = await runCommand("bun pm pkg get peerDependencies");

        console.log("📊 Current dependency counts:");
        console.log(`   dependencies: ${Object.keys(JSON.parse(deps || '{}')).length} packages`);
        console.log(`   devDependencies: ${Object.keys(JSON.parse(devDeps || '{}')).length} packages`);
        console.log(`   optionalDependencies: ${JSON.parse(optionalDeps || 'null') ? Object.keys(JSON.parse(optionalDeps)).length : 0} packages`);
        console.log(`   peerDependencies: ${JSON.parse(peerDeps || 'null') ? Object.keys(JSON.parse(peerDeps)).length : 0} packages`);

    } catch (error) {
        console.log("⚠️  Could not analyze current dependencies:", error.message);
    }

    console.log("\n🏗️ Real-World Scenarios:");
    console.log("======================");

    console.log("📝 Scenario 1: TypeScript in Multiple Groups");
    console.log("   dependencies: typescript ^5.0.0");
    console.log("   devDependencies: typescript ^5.3.0");
    console.log("   → Bun installs: typescript ^5.3.0 (devDependencies wins)");
    console.log("");

    console.log("📝 Scenario 2: React Version Conflicts");
    console.log("   dependencies: react 18.2.0");
    console.log("   devDependencies: react 18.3.0");
    console.log("   peerDependencies: react ^18.0.0");
    console.log("   → Bun installs: react 18.3.0 (devDependencies wins)");
    console.log("");

    console.log("📝 Scenario 3: Build Tools Priority");
    console.log("   dependencies: webpack ^5.80.0");
    console.log("   devDependencies: webpack ^5.89.0");
    console.log("   optionalDependencies: webpack ^5.85.0");
    console.log("   → Bun installs: webpack ^5.89.0 (devDependencies wins)");
    console.log("");

    console.log("🎯 Benefits for Enterprise Projects:");
    console.log("===================================");
    console.log("✅ Predictable dependency resolution");
    console.log("✅ Development tools get priority over runtime");
    console.log("✅ Optional dependencies don't override dev tools");
    console.log("✅ Peer dependencies have lowest priority (as expected)");
    console.log("✅ Consistent behavior across different environments");
    console.log("");

    console.log("🔧 Practical Commands:");
    console.log("=====================");

    console.log("# Check what version would be installed:");
    console.log("bun why semver");
    console.log("");

    console.log("# Add to devDependencies (highest priority):");
    console.log("bun pm pkg set devDependencies.typescript='^5.3.0'");
    console.log("");

    console.log("# Add to dependencies (lower priority):");
    console.log("bun pm pkg set dependencies.react='^18.2.0'");
    console.log("");

    console.log("# Override with devDependency:");
    console.log("bun pm pkg set devDependencies.react='^18.3.0'");
    console.log("");

    console.log("📚 Integration with Fire22 Project:");
    console.log("==================================");

    console.log("🔄 For your dashboard development:");
    console.log("   - Use devDependencies for: TypeScript, testing tools, build tools");
    console.log("   - Use dependencies for: Runtime libraries, UI frameworks");
    console.log("   - Use optionalDependencies for: Platform-specific tools");
    console.log("   - Use peerDependencies for: Plugins, extensions");
    console.log("");

    console.log("💡 Best Practices:");
    console.log("==================");
    console.log("1. Put development tools in devDependencies (they get priority)");
    console.log("2. Put runtime dependencies in dependencies");
    console.log("3. Use optionalDependencies sparingly");
    console.log("4. Use peerDependencies for plugins/extensions");
    console.log("5. Let Bun's priority system handle version conflicts");
    console.log("");

    console.log("🎉 Demo Complete!");
    console.log("=================");
    console.log("✅ Understood dependency resolution priority");
    console.log("✅ Demonstrated real-world scenarios");
    console.log("✅ Integrated with Fire22 project practices");
    console.log("✅ Provided practical usage commands");
}

// Helper function to run commands
async function runCommand(cmd) {
    try {
        const proc = Bun.spawn(cmd.split(" "), {
            stdout: "pipe",
            stderr: "pipe"
        });

        const output = await new Response(proc.stdout).text();
        const errorOutput = await new Response(proc.stderr).text();

        const exitCode = await proc.exited;
        if (exitCode !== 0) {
            throw new Error(`Command failed: ${errorOutput}`);
        }

        return output.trim();
    } catch (error) {
        return null;
    }
}

// Run the demonstration
if (import.meta.main) {
    demonstrateDependencyResolution().catch(console.error);
}

export { demonstrateDependencyResolution };
