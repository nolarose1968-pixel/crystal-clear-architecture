#!/usr/bin/env bun

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const departmentsDir = join(process.cwd(), 'src', 'departments');

async function updateDepartmentWithDynamicTasks() {
  const files = await readdir(departmentsDir);
  const departmentFiles = files.filter(
    file => file.endsWith('-department.html') && !file.includes('template')
  );

  console.log(`Found ${departmentFiles.length} department files to update`);

  for (const file of departmentFiles) {
    const filePath = join(departmentsDir, file);
    console.log(`\nProcessing: ${file}`);

    try {
      let content = await readFile(filePath, 'utf-8');

      // Check if already has dynamic loading
      if (content.includes('department-tasks.js')) {
        console.log(`  ✓ Already has dynamic task loading`);
        continue;
      }

      // Add script tag before closing body tag
      const scriptTag = `
    <!-- Dynamic Task Loading -->
    <script src="../js/department-tasks.js"></script>`;

      // Replace static current-tasks-section with dynamic container
      if (content.includes('class="current-tasks-section"')) {
        // Replace the entire static section with a container for dynamic content
        const containerHTML = `
            <!-- Current Tasks Section (Dynamic) -->
            <div class="current-tasks-section" style="margin-top: 40px;">
                <div id="department-tasks-container" style="padding: 20px; background: #f9fafb; border-radius: 8px;">
                    <div style="text-align: center; padding: 20px; color: #6b7280;">
                        <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <p style="margin-top: 12px;">Loading tasks...</p>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>`;

        // Find and replace the static tasks section
        const startPattern =
          /<!-- Current Tasks Section -->\s*<div class="current-tasks-section"[^>]*>/;
        const endPattern = /<\/div>\s*(?=<!-- |<\/section>|$)/;

        // Find the complete section
        const startMatch = content.match(startPattern);
        if (startMatch) {
          const startIndex = startMatch.index;
          let depth = 1;
          let currentIndex = startIndex + startMatch[0].length;

          // Find matching closing div
          while (depth > 0 && currentIndex < content.length) {
            const nextOpen = content.indexOf('<div', currentIndex);
            const nextClose = content.indexOf('</div>', currentIndex);

            if (nextClose === -1) break;

            if (nextOpen !== -1 && nextOpen < nextClose) {
              depth++;
              currentIndex = nextOpen + 4;
            } else {
              depth--;
              currentIndex = nextClose + 6;
            }
          }

          // Replace the entire section
          content = content.slice(0, startIndex) + containerHTML + content.slice(currentIndex);
          console.log(`  ✓ Replaced static tasks with dynamic container`);
        } else {
          // Add new container if no existing tasks section
          const insertBefore = '</section>';
          content = content.replace(insertBefore, containerHTML + '\n        ' + insertBefore);
          console.log(`  ✓ Added dynamic tasks container`);
        }
      } else if (!content.includes('department-tasks-container')) {
        // Add container if no tasks section exists
        const containerHTML = `
            <!-- Current Tasks Section (Dynamic) -->
            <div class="current-tasks-section" style="margin-top: 40px;">
                <div id="department-tasks-container" style="padding: 20px; background: #f9fafb; border-radius: 8px;">
                    <div style="text-align: center; padding: 20px; color: #6b7280;">
                        <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <p style="margin-top: 12px;">Loading tasks...</p>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>`;

        const insertBefore = '</section>';
        content = content.replace(insertBefore, containerHTML + '\n        ' + insertBefore);
        console.log(`  ✓ Added new dynamic tasks container`);
      }

      // Add script tag before closing body
      if (!content.includes('</body>')) {
        // If no body tag, add at end
        content += scriptTag + '\n';
      } else {
        content = content.replace('</body>', scriptTag + '\n</body>');
      }
      console.log(`  ✓ Added department-tasks.js script`);

      // Write updated content
      await writeFile(filePath, content, 'utf-8');
      console.log(`  ✓ Successfully updated ${file}`);
    } catch (error) {
      console.error(`  ✗ Error updating ${file}:`, error.message);
    }
  }

  console.log('\n✅ Finished updating department files with dynamic task loading');
}

// Run the update
updateDepartmentWithDynamicTasks().catch(console.error);
