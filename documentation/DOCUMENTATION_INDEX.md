# 📚 Documentation Index

Welcome to the Throne and Liberty DPS Meter documentation. This index helps you find the right resource for your needs.

## 🎯 For Different User Types

### 👤 Users (Non-Technical)
**Start here if you want to use the app to analyze combat logs**

1. **[QUICKSTART.md](./QUICKSTART.md)** ⭐ **START HERE**
   - How to run the application
   - How to upload combat logs
   - How to interpret results
   - Troubleshooting guide

2. **[README.md](./README.md)**
   - Complete feature overview
   - Installation instructions
   - Detailed usage guide
   - Performance tips

### 👨‍💻 Developers
**Start here if you want to understand the code and extend it**

1. **[API.md](./API.md)** ⭐ **START HERE**
   - TypeScript type definitions
   - Component APIs
   - Parser methods
   - How to extend the app

2. **[PROJECT_DOCS.md](./PROJECT_DOCS.md)**
   - Complete architecture overview
   - Technical stack details
   - Component deep-dive
   - Algorithm explanations
   - Customization guide

3. **Source Code** (`src/` folder)
   - Well-commented TypeScript files
   - Clear component structure
   - Reusable utilities

### 🔧 DevOps / Deployment
**Start here if you want to deploy the app**

1. **[README.md](./README.md)** - Build & Preview sections
   - Production build commands
   - Build output location

2. **[PROJECT_DOCS.md](./PROJECT_DOCS.md)** - Build & Deployment section
   - Deployment options
   - Docker considerations
   - Performance metrics

---

## 📖 Documentation Guide

### Quick Reference

| Document | Purpose | Read Time | Best For |
|----------|---------|-----------|----------|
| **QUICKSTART.md** | Get started fast | 10 min | First-time users |
| **README.md** | Complete user guide | 20 min | Learning features |
| **API.md** | Developer reference | 15 min | Coding extensions |
| **PROJECT_DOCS.md** | Deep technical details | 30 min | Understanding architecture |
| **COMPLETION_CHECKLIST.md** | Project status | 5 min | Verification |

### By Topic

#### Getting Started
- Setup: [QUICKSTART.md](./QUICKSTART.md) → Installation section
- First upload: [QUICKSTART.md](./QUICKSTART.md) → Usage section
- Testing: [QUICKSTART.md](./QUICKSTART.md) → Testing section

#### Using the App
- File format: [README.md](./README.md) → Combat Log Format section
- Interpreting results: [README.md](./README.md) → Viewing Results section
- Troubleshooting: [README.md](./README.md) → Troubleshooting section

#### Customizing
- Change parser regex: [API.md](./API.md) → Extending the Parser section
- Change colors: [PROJECT_DOCS.md](./PROJECT_DOCS.md) → Customization Guide section
- Modify statistics: [API.md](./API.md) → Adding New Statistics section

#### Development
- Architecture: [PROJECT_DOCS.md](./PROJECT_DOCS.md) → Component Architecture section
- Types reference: [API.md](./API.md) → TypeScript Types section
- Methods reference: [API.md](./API.md) → CombatLogParser Class section

#### Deployment
- Build for production: [README.md](./README.md) → Build section
- Deploy options: [PROJECT_DOCS.md](./PROJECT_DOCS.md) → Deployment Options section
- Performance tips: [API.md](./API.md) → Performance Considerations section

---

## 🗂️ File Organization

```
Documentation Files:
├── README.md                   # Main user guide
├── QUICKSTART.md              # Get started in 10 minutes
├── API.md                     # Developer API reference
├── PROJECT_DOCS.md            # Complete technical documentation
├── COMPLETION_CHECKLIST.md    # Project status and checklist
└── DOCUMENTATION_INDEX.md     # This file

Source Code:
├── src/components/            # React components
│   ├── DPSMeter.tsx          # Main container
│   ├── DPSChart.tsx          # Chart visualization
│   ├── StatsTable.tsx        # Statistics display
│   └── FileUpload.tsx        # File upload handler
├── src/utils/
│   └── logParser.ts          # Parsing engine
├── src/types/
│   └── combatLog.ts          # Type definitions
└── src/styles/
    └── DPSMeter.css          # Dark theme styles

Config Files:
├── package.json              # Dependencies
├── vite.config.ts           # Build configuration
├── tsconfig.json            # TypeScript configuration
└── .github/copilot-instructions.md
```

---

## 🚀 Common Tasks

### "I want to use the app"
1. Read: [QUICKSTART.md](./QUICKSTART.md)
2. Run: `npm run dev`
3. Visit: http://localhost:5173/
4. Upload: Your combat log

### "I want to customize the UI"
1. Read: [PROJECT_DOCS.md](./PROJECT_DOCS.md) → Customization Guide
2. Edit: `src/styles/DPSMeter.css`
3. Run: `npm run dev` (auto-refresh)

### "I want to change the parser"
1. Read: [API.md](./API.md) → Extending the Parser
2. Edit: `src/utils/logParser.ts` line ~12
3. Test: Upload a log to verify

### "I want to add a new feature"
1. Read: [API.md](./API.md) → Component APIs
2. Read: [PROJECT_DOCS.md](./PROJECT_DOCS.md) → Component Architecture
3. Create new component or extend existing
4. Test: `npm run dev`

### "I want to deploy the app"
1. Run: `npm run build`
2. Read: [PROJECT_DOCS.md](./PROJECT_DOCS.md) → Deployment Options
3. Upload `dist/` folder to hosting
4. Done!

### "Something isn't working"
1. Check: [README.md](./README.md) → Troubleshooting
2. Check: Browser console (F12)
3. Check: Verify combat log format
4. Check: Sample log works? (`public/sample-log.txt`)

---

## 💡 Pro Tips

1. **Search Shortcut**: Use Ctrl+F (Cmd+F on Mac) to search documentation
2. **API Offline**: [API.md](./API.md) can be read without internet
3. **Sample Data**: Always test with `sample-log.txt` first
4. **Dark Mode**: App is dark by default, great for night gaming

---

## 🎓 Learning Path

### Beginner (Just want to use it)
```
1. QUICKSTART.md (10 min)
   ↓
2. Open app + upload sample log (5 min)
   ↓
3. Upload your own log (5 min)
   ↓
Done! You're using the app
```

### Intermediate (Want to customize it)
```
1. QUICKSTART.md (10 min)
2. README.md (20 min)
3. API.md - Customization section (10 min)
   ↓
4. Edit CSS or regex (5-15 min per change)
5. Test with sample log (5 min)
   ↓
Done! App customized for your needs
```

### Advanced (Want to extend it)
```
1. All docs above (1 hour total)
2. PROJECT_DOCS.md (30 min)
3. Review source code structure (15 min)
4. Understand component architecture (20 min)
   ↓
5. Implement new feature (varies)
6. Test and deploy (15 min)
   ↓
Done! Extended the application
```

---

## 📞 Support Resources

### Built-in Help
- **Inline code comments**: Check `src/` folder
- **Type hints**: TypeScript shows types on hover (VS Code)
- **Sample data**: `public/sample-log.txt` for testing

### Documentation
- **Feature questions**: See [README.md](./README.md)
- **Technical questions**: See [PROJECT_DOCS.md](./PROJECT_DOCS.md)
- **API questions**: See [API.md](./API.md)
- **How-to questions**: See [QUICKSTART.md](./QUICKSTART.md)

### Troubleshooting
- **App won't start**: [QUICKSTART.md](./QUICKSTART.md) → Troubleshooting
- **Parser issues**: [API.md](./API.md) → Extending the Parser
- **Performance slow**: [PROJECT_DOCS.md](./PROJECT_DOCS.md) → Performance Metrics

---

## 🔗 Quick Links

| Resource | Link |
|----------|------|
| Get Started | [QUICKSTART.md](./QUICKSTART.md) |
| User Guide | [README.md](./README.md) |
| API Reference | [API.md](./API.md) |
| Technical Docs | [PROJECT_DOCS.md](./PROJECT_DOCS.md) |
| Project Status | [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) |
| Source Code | `src/` folder |
| Sample Data | `public/sample-log.txt` |

---

## 📋 Document Sizes

| Document | Size | Est. Reading Time |
|----------|------|-------------------|
| QUICKSTART.md | ~8 KB | 10-15 min |
| README.md | ~12 KB | 15-20 min |
| API.md | ~15 KB | 15-20 min |
| PROJECT_DOCS.md | ~18 KB | 25-35 min |
| COMPLETION_CHECKLIST.md | ~12 KB | 5-10 min |

**Total**: ~55 KB of comprehensive documentation

---

## ✅ Verification

All documentation files are:
- ✅ Complete and accurate
- ✅ Cross-referenced
- ✅ Up-to-date (December 2, 2025)
- ✅ Well-organized
- ✅ Easy to navigate
- ✅ Available offline

---

## 🎯 Your Next Step

**Choose one**:

- 👤 **I'm a user**: Go to [QUICKSTART.md](./QUICKSTART.md)
- 👨‍💻 **I'm a developer**: Go to [API.md](./API.md)
- 🔧 **I'm deploying**: Go to [PROJECT_DOCS.md](./PROJECT_DOCS.md) → Deployment
- ❓ **I have questions**: Go to [README.md](./README.md) → Troubleshooting

---

**Happy analyzing! ⚔️🎮**

*Last updated: December 2, 2025*
