# 🌱 MindSprout - AI-Powered Learning Companion

> **Assignment Submission for House of EdTech**  
> *Scale your self-study with structured paths and generative AI.*

## 🚀 Project Overview

**MindSprout** addresses the chaos of self-guided learning. We live in an era of infinite content but zero structure. Learners drown in open tabs, bookmarked tutorials, and disconnected videos, making it hard to track progress or retain knowledge.

MindSprout allows users to curate **Learning Paths**—structured collections of resources (videos, articles, docs)—and leverages **Google's Gemini AI** to actively help them learn. It turns passive consumption into active mastery through automated summaries, generated quizzes, and flashcards.

## 🛠️ Tech Stack & Architecture

Built with a focus on performance, type safety, and modern UX.

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, Framer Motion
- **Database:** PostgreSQL (via [Prisma ORM](https://www.prisma.io/))
- **Authentication:** [Clerk](https://clerk.com/)
- **AI Engine:** [Vercel AI SDK](https://sdk.vercel.ai/docs) + Google Gemini 1.5 Flash
- **Key Libraries:** `cheerio` (scraping), `canvas-confetti`, `react-hot-toast`, `lucide-react`

### Architecture Highlights
- **Server Actions:** All data mutations and AI interactions happen server-side for security and speed.
- **AI Pipelines:** Custom prompts in `lib/ai-actions.ts` handle context windowing and structured JSON generation for Quizzes/Flashcards.
- **Optimistic UI:** Immediate feedback states while AI processes run in the background.

## ✨ Key Features

### 1. 🗺️ Custom Learning Paths
Create dedicated tracks for any topic (e.g., "System Design", "Rust for Beginners"). Organize your scattered links into a cohesive curriculum.

### 2. 🧠 Universal AI Summarizer
Drop a link to a YouTube video, blog post, or documentation. MindSprout scrapes the content and uses **Gemini 1.5 Flash** to generate concise, study-focused notes (Key Concepts, Actionable Takeaways).

### 3. 📝 Generative Quizzes
Test your knowledge instantly. The AI analyzes *all* resources in your path to generate a unique, context-aware 10-question Multiple Choice Quiz.
- Difficulty scaling (Easy/Medium/Hard)
- Source attribution (knows which resource the question came from)
- Score tracking and history



## 🏃‍♂️ Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/mind-sprout.git
   cd mind-sprout
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file with the following keys:
   ```env
   DATABASE_URL="postgresql://..."
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   GEMINI_API_KEY="AIza..."
   ```

4. **Initialize Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🚧 Challenges & Optimizations

- **Challenge:** LLM Context Limits with multiple long articles.
  - *Optimization:* Implemented intelligent text truncation and focused scraping (removing nav/footers) to maximize relevant tokens for Gemini.
- **Challenge:** Latency in AI generation.
  - *Optimization:* Chose **Gemini 1.5 Flash** for the best balance of speed and reasoning capability. Added granular loading states to the UI to keep users engaged.

---
*Built with ❤️ by Rajashekhar*
