import "../../shared-styles/highlight.css";

console.log("🔥 CSS imported successfully!");
console.log("📦 Testing Bun CSS bundling");

// Create a test element
const testDiv = document.createElement('div');
testDiv.className = 'fire22-highlight fire22-package-card';
testDiv.innerHTML = '<h3>Test Package</h3><p>CSS bundling working!</p>';
testDiv.style.margin = '20px';
testDiv.style.padding = '20px';

document.body.appendChild(testDiv);