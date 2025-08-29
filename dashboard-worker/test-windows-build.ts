#!/usr/bin/env bun

console.log('🪟 Testing Windows Metadata Build with Bun.build() API');

await Bun.build({
  entrypoints: ['./test-embedded.ts'],
  outfile: './dist/fire22-windows.exe',
  compile: {
    windows: {
      title: 'Fire22 Dashboard',
      publisher: 'Fire22 Development Team',
      version: '3.0.9.0',
      description: 'Professional dashboard for Fire22 sportsbook platform',
      copyright: '© 2024 Fire22 Development Team',
    },
  },
});

console.log('✅ Windows executable built with metadata!');
