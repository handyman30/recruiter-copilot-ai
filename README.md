# RecruiterCopilot.ai 🚀

AI-powered resume screening that matches candidates to job descriptions in seconds. Built for recruiters who want to spend less time screening and more time connecting with the right candidates.

![RecruiterCopilot.ai](https://img.shields.io/badge/AI-Powered-blue) ![Free](https://img.shields.io/badge/Price-Free-green) ![Beta](https://img.shields.io/badge/Status-Beta-orange)

## 🎯 Features

- **Instant Match Analysis**: Upload job description + resume → Get match percentage in seconds
- **Smart Skills Extraction**: Automatically identifies top 3 matching skills
- **Auto-Tagging**: Extracts location, seniority level, and tech stack from resumes
- **Personalized Messages**: AI generates follow-up messages based on match score
- **Bulk Processing**: Handle multiple candidates at once
- **Beautiful Dashboard**: Clean, modern UI for managing jobs and candidates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Google Gemini API key (free tier available)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/handyman30/recruiter-copilot-ai.git
cd recruiter-copilot-ai
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:
```bash
cd ../server
cp .env.example .env
# Edit .env with your database URL and Gemini API key
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Start the application:
```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

Visit `http://localhost:5173` to start using RecruiterCopilot.ai!

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, Prisma
- **Database**: PostgreSQL
- **AI**: Google Gemini API (switchable to OpenAI)
- **File Processing**: pdf-parse, mammoth

## 📱 Usage

1. **Upload a Job Description**: PDF or DOCX format
2. **Upload Candidate Resumes**: Support for multiple formats
3. **Get Instant Analysis**:
   - Match percentage
   - Top matching skills
   - Missing skills
   - Auto-generated tags
   - Personalized follow-up message

## 🗺️ Roadmap

See [FEATURE_ROADMAP.md](FEATURE_ROADMAP.md) for detailed upcoming features including:
- ATS integrations (Greenhouse, Lever, Workday)
- Bulk processing with CSV export
- Team collaboration features
- Advanced AI analytics

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guides:
- Railway (recommended - one-click deploy)
- Vercel + Supabase
- Render.com

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📬 Outreach

If you're a recruiter interested in using or providing feedback on RecruiterCopilot.ai, see [RECRUITER_OUTREACH.md](RECRUITER_OUTREACH.md) for templates and contact information.

## 📄 License

MIT License - feel free to use this in your own projects!

## 🙏 Acknowledgments

Built with ❤️ to help recruiters save time and find the best candidates faster.

---

**Questions?** Open an issue or reach out on [LinkedIn](your-linkedin-url)
# Updated for Railway deployment
