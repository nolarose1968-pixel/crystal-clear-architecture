# 🎨 Fire22 Personal Subdomain Design Standards
## Design System for Employee Personal Sites

**Document Type**: Design Standards & Guidelines  
**Version**: 1.0  
**Created By**: Isabella Martinez (Design Director), HR & Design Teams  
**Date**: August 28, 2025  
**Reference**: HR-DESIGN-REVIEW-MTG-2025-082801  

---

## 🎯 DESIGN VISION

**Every Fire22 employee's personal subdomain must reflect our brand excellence while allowing individual professional expression.**

---

## 🎨 VISUAL IDENTITY SYSTEM

### **Brand Colors**
```css
/* Primary Palette */
--fire22-orange: #ff6b35;      /* Primary brand color */
--fire22-gold: #f7931e;        /* Secondary accent */
--fire22-dark-blue: #0a0e27;   /* Dark background */
--fire22-navy: #151932;        /* Secondary background */
--fire22-midnight: #1a1f3a;    /* Tertiary background */

/* UI Colors */
--fire22-light: #e0e6ed;       /* Primary text */
--fire22-muted: #a0a9b8;       /* Secondary text */
--fire22-accent: #40e0d0;      /* Turquoise accent */
--fire22-success: #10b981;     /* Success state */
--fire22-warning: #f59e0b;     /* Warning state */
--fire22-error: #ef4444;       /* Error state */

/* Department Colors */
--dept-vip: #ffd700;           /* VIP Management Gold */
--dept-finance: #10b981;       /* Finance Green */
--dept-tech: #06b6d4;          /* Technology Cyan */
--dept-operations: #f59e0b;    /* Operations Orange */
--dept-support: #3b82f6;       /* Support Blue */
```

### **Typography System**
```css
/* Font Families */
--font-display: 'Inter', system-ui, sans-serif;      /* Headings */
--font-body: 'Roboto', system-ui, sans-serif;        /* Body text */
--font-mono: 'SF Mono', 'Monaco', monospace;         /* Code/data */

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### **Spacing & Layout**
```css
/* Spacing Scale */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */

/* Container Widths */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

---

## 📐 TEMPLATE ARCHITECTURE

### **5-Tier Template System**

#### **Tier 1: Executive Template** 👑
**For**: CEO, COO, CTO, CFO, Department Heads  
**Color Accent**: Gold (#ffd700)  
**Features**:
- Full-width hero section with professional photo
- Executive bio and vision statement
- Team overview dashboard
- Department metrics display
- Direct report quick access
- Strategic initiatives showcase
- Board meeting scheduler

#### **Tier 2: Management Template** 📊
**For**: Directors, Managers, Team Leads  
**Color Accent**: Department-specific  
**Features**:
- Professional header with role highlight
- Team member grid
- Project portfolio section
- Department resources
- Meeting scheduler
- Performance dashboard access
- Team collaboration tools

#### **Tier 3: Specialist Template** 🎯
**For**: Senior roles, Subject matter experts  
**Color Accent**: Role-specific  
**Features**:
- Expertise showcase section
- Professional certifications display
- Project case studies
- Technical skills matrix
- Publication/contribution list
- Consultation booking
- Knowledge base links

#### **Tier 4: Standard Template** 💼
**For**: All team members  
**Color Accent**: Department color  
**Features**:
- Clean professional profile
- Contact information card
- Role responsibilities
- Quick action buttons
- Department integration
- Calendar availability
- Team directory link

#### **Tier 5: VIP/Custom Template** 💎
**For**: Special roles (e.g., Vinny2times)  
**Color Accent**: Custom (VIP Gold)  
**Features**:
- Fully customized design
- Department-specific tools
- Specialized workflows
- Custom branding elements
- Enhanced security features
- Priority support tools
- Custom analytics dashboard

---

## 🧩 COMPONENT LIBRARY

### **Header Component**
```html
<header class="fire22-header">
  <div class="header-gradient"></div>
  <nav class="header-nav">
    <img src="/assets/fire22-logo.svg" alt="Fire22" class="logo">
    <div class="nav-links">
      <a href="#profile">Profile</a>
      <a href="#schedule">Schedule</a>
      <a href="#tools">Tools</a>
      <a href="#contact">Contact</a>
    </div>
  </nav>
</header>
```

### **Profile Card Component**
```html
<div class="profile-card">
  <div class="profile-image">
    <img src="[employee-photo]" alt="[Name]">
    <span class="status-indicator online"></span>
  </div>
  <div class="profile-info">
    <h1 class="name">[Employee Name]</h1>
    <h2 class="title">[Job Title]</h2>
    <div class="department-badge">[Department]</div>
    <p class="bio">[Professional Bio]</p>
  </div>
</div>
```

### **Quick Actions Grid**
```html
<div class="quick-actions">
  <button class="action-btn primary">
    <span class="icon">📧</span>
    <span class="label">Email Me</span>
  </button>
  <button class="action-btn secondary">
    <span class="icon">📅</span>
    <span class="label">Schedule Meeting</span>
  </button>
  <button class="action-btn accent">
    <span class="icon">💬</span>
    <span class="label">Slack Chat</span>
  </button>
</div>
```

### **Contact Information**
```html
<div class="contact-card">
  <h3>Get in Touch</h3>
  <ul class="contact-list">
    <li><span class="icon">📧</span> email@fire22.com</li>
    <li><span class="icon">📞</span> +1-555-0000</li>
    <li><span class="icon">💬</span> @slack-handle</li>
    <li><span class="icon">📱</span> @telegram-handle</li>
  </ul>
</div>
```

---

## 📱 RESPONSIVE DESIGN

### **Breakpoints**
```css
/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### **Mobile Optimization**
- **Touch targets**: Minimum 44x44px
- **Font sizes**: Minimum 16px for body text
- **Spacing**: Increased padding on mobile
- **Navigation**: Hamburger menu on small screens
- **Images**: Responsive and optimized for mobile

---

## ♿ ACCESSIBILITY STANDARDS

### **WCAG 2.1 AA Compliance**
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: Full site navigable via keyboard
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Indicators**: Clear visual focus states
- **Alt Text**: Descriptive alt text for all images

### **Implementation Checklist**
- [ ] All interactive elements have focus states
- [ ] Color is not the only means of conveying information
- [ ] Forms have proper labels and error messages
- [ ] Headings follow logical hierarchy (h1 → h2 → h3)
- [ ] Links have descriptive text (not "click here")
- [ ] Videos have captions and transcripts
- [ ] Page is usable at 200% zoom

---

## 🎨 DESIGN ASSETS

### **Required Assets Per Employee**
1. **Professional Headshot**
   - Format: JPG/PNG
   - Dimensions: 800x800px minimum
   - File size: < 500KB optimized
   - Background: Neutral or Fire22 branded

2. **Fire22 Logo Variations**
   - Full logo (horizontal)
   - Icon only
   - White/dark variants
   - Department sub-brands

3. **Department Icons**
   - SVG format preferred
   - Consistent 24x24px grid
   - Two-tone design
   - Matches department color

4. **Background Patterns**
   - Subtle geometric patterns
   - Fire22 brand gradients
   - Department-specific overlays

---

## 🚀 IMPLEMENTATION WORKFLOW

### **Week 1: Design Phase**
1. **Day 1-2**: Create wireframes for all 5 tiers
2. **Day 3-4**: Design high-fidelity mockups in Figma
3. **Day 5**: Review and approval with HR/Management

### **Week 2: Development Phase**
1. **Day 1-2**: Build HTML/CSS templates
2. **Day 3-4**: Create component library
3. **Day 5**: Testing and optimization

### **Week 3: Rollout Phase**
1. **Day 1-2**: Deploy templates for executives
2. **Day 3-4**: Roll out to all departments
3. **Day 5**: Final QA and adjustments

---

## ✅ QUALITY ASSURANCE

### **Design Review Checklist**
- [ ] **Brand Compliance**: Uses Fire22 colors and typography
- [ ] **Professional Quality**: High-quality images and content
- [ ] **Responsive Design**: Works on all screen sizes
- [ ] **Performance**: Loads in < 3 seconds
- [ ] **Accessibility**: Meets WCAG 2.1 AA standards
- [ ] **Cross-browser**: Chrome, Firefox, Safari, Edge
- [ ] **Print Ready**: Clean print stylesheet

### **Approval Process**
1. **Employee submits** design for review
2. **Design team validates** (1 business day)
3. **HR approves** content (1 business day)
4. **IT deploys** to production (same day)

---

## 📚 RESOURCES & SUPPORT

### **Design Resources**
- **Figma Project**: Fire22 Personal Subdomains
- **Component Library**: fire22-components.figma.com
- **Brand Guidelines**: brand.fire22.com
- **Icon Library**: icons.fire22.com

### **Support Channels**
- **Design Team Slack**: #design-team
- **Office Hours**: Tuesdays & Thursdays 2-4 PM
- **Email**: design@fire22.com
- **Documentation**: design-docs.fire22.com

---

## 🎯 SUCCESS METRICS

### **Design Quality Metrics**
- **95% First-Pass Approval**: Designs meet standards
- **100% Brand Compliance**: Consistent Fire22 identity
- **AAA Accessibility**: Exceeds minimum requirements
- **< 3s Load Time**: Optimized performance

### **User Satisfaction**
- **90% Employee Satisfaction**: With personal site design
- **< 48 Hour Turnaround**: Design to deployment
- **Zero Security Issues**: No vulnerabilities
- **100% Mobile Responsive**: Perfect on all devices

---

**Design Approval**:  
Isabella Martinez - Design Director  
`isabella-martinez@design.fire22`  
`https://isabella-martinez.fire22.workers.dev/`

**HR Approval**:  
Jennifer Adams - HR Director  
`jennifer-adams@hr.fire22`  
`https://jennifer-adams.fire22.workers.dev/`

---

*This document represents the official design standards for all Fire22 employee personal subdomains.*