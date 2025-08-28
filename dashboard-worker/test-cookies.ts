#!/usr/bin/env bun

import { Cookie, CookieMap } from 'bun';

console.log('🍪 Testing Bun Cookie APIs\n');
console.log('='.repeat(60));

// Test CookieMap
console.log('\n📦 CookieMap Tests:');
const cookies = new CookieMap({
  fire22_session: 'abc123',
  fire22_theme: 'dark',
  fire22_lang: 'en'
});

console.log(`  Size: ${cookies.size}`);
console.log(`  Has session: ${cookies.has('fire22_session')}`);
console.log(`  Session value: ${cookies.get('fire22_session')}`);

// Add new cookie
cookies.set('fire22_user', 'BLAKEPPH');
console.log(`  After adding user: ${cookies.size} cookies`);

// Iterate
console.log('\n  All cookies:');
for (const [name, value] of cookies) {
  console.log(`    ${name}: ${value}`);
}

// Test Cookie class
console.log('\n🔒 Secure Cookie Tests:');
const secureCookie = new Cookie('fire22_token', 'eyJhbGc...', {
  secure: true,
  httpOnly: true,
  sameSite: 'strict',
  maxAge: 3600,
  path: '/api',
  domain: '.fire22.ag'
});

console.log(`  Name: ${secureCookie.name}`);
console.log(`  Value: ${secureCookie.value.substring(0, 10)}...`);
console.log(`  Secure: ${secureCookie.secure}`);
console.log(`  HttpOnly: ${secureCookie.httpOnly}`);
console.log(`  SameSite: ${secureCookie.sameSite}`);
console.log(`  Path: ${secureCookie.path}`);
console.log(`  Domain: ${secureCookie.domain}`);
console.log(`  Expired: ${secureCookie.isExpired()}`);

// Serialize for Set-Cookie header
console.log('\n📤 Set-Cookie Header:');
console.log(`  ${secureCookie.toString()}`);

// Test expired cookie
console.log('\n⏰ Expired Cookie Test:');
const expiredCookie = new Cookie('old_session', 'xyz', {
  expires: new Date(Date.now() - 1000)
});
console.log(`  Is expired: ${expiredCookie.isExpired()}`);

// Test cookie parsing
console.log('\n🔍 Cookie Parsing:');
const parsedCookie = Cookie.parse('name=value; Path=/; Secure; HttpOnly; SameSite=lax');
console.log(`  Parsed name: ${parsedCookie.name}`);
console.log(`  Parsed secure: ${parsedCookie.secure}`);
console.log(`  Parsed httpOnly: ${parsedCookie.httpOnly}`);

// Test Set-Cookie headers generation
console.log('\n📋 Generate Set-Cookie Headers:');
const responseCookies = new CookieMap();
responseCookies.set('session', 'new123', { 
  secure: true, 
  httpOnly: true,
  maxAge: 86400 
});
responseCookies.set('visited', 'true', { 
  maxAge: 604800 
});

const headers = responseCookies.toSetCookieHeaders();
console.log(`  Generated ${headers.length} Set-Cookie headers:`);
headers.forEach(h => console.log(`    ${h}`));

console.log('\n✅ All Cookie API tests complete!');