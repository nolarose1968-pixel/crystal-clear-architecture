#!/usr/bin/env bun

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const departmentsDir = join(process.cwd(), 'src', 'departments');

async function fixDynamicTasks() {
    const files = await readdir(departmentsDir);
    const departmentFiles = files.filter(file => 
        file.endsWith('-department.html') && 
        !file.includes('template')
    );

    console.log(`Found ${departmentFiles.length} department files to fix`);

    const dynamicTasksHTML = `
            <!-- Current Tasks Section (Dynamic) -->
            <div class="current-tasks-section" style="margin-top: 40px;">
                <div id="department-tasks-container" style="padding: 20px; background: rgba(0, 0, 0, 0.2); border-radius: 12px;">
                    <div style="text-align: center; padding: 40px; color: #6b7280;">
                        <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: var(--dept-primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <p style="margin-top: 16px; color: var(--dept-primary);">Loading tasks...</p>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>`;

    for (const file of departmentFiles) {
        const filePath = join(departmentsDir, file);
        console.log(`\nProcessing: ${file}`);

        try {
            let content = await readFile(filePath, 'utf-8');

            // Skip if already has proper dynamic container
            if (content.includes('id="department-tasks-container"')) {
                console.log(`  ✓ Already has dynamic task container`);
                continue;
            }

            // Find and replace the static tasks section
            const tasksSectionRegex = /<h3[^>]*>📋 Current Tasks[^<]*<\/h3>.*?(?=<div class="implementation-links"|<\/section>|$)/s;
            
            if (tasksSectionRegex.test(content)) {
                content = content.replace(tasksSectionRegex, dynamicTasksHTML);
                
                await writeFile(filePath, content, 'utf-8');
                console.log(`  ✓ Replaced static tasks with dynamic container in ${file}`);
            } else {
                console.log(`  ⚠ No tasks section found in ${file}`);
            }
            
        } catch (error) {
            console.error(`  ✗ Error updating ${file}:`, error.message);
        }
    }

    console.log('\n✅ Finished fixing dynamic task loading');
}

// Run the fix
fixDynamicTasks().catch(console.error);