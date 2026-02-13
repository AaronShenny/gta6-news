# Automated GTA 6 News Website

A fully automated news aggregator for Grand Theft Auto VI. Fetches news from RSS feeds, summarizes them using Google Gemini AI, and deploys a static Next.js website to GitHub Pages.

## Features
- **Automated Fetching**: Python script fetches news from IGN, GamesSpot, Reddit, etc.
- **AI Summarization**: Uses Gemini 1.5 Flash to generate concise summaries and key takeaways.
- **SEO Optimized**: Generates static HTML with proper meta tags and OpenGraph data.
- **Modern UI**: Built with Next.js 14 and Tailwind CSS.
- **Git Integration**: Automatically commits new posts to the repository.

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/gta6-news.git
   cd gta6-news
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in your keys:
   ```
   GEMINI_API_KEY=your_key
   GITHUB_TOKEN=your_token
   ```

## Usage

### Run Manually
```bash
# Fetch new posts
python backend/fetch.py

# Build frontend
cd frontend
npm run build
```

### Automation
The GitHub Actions workflows in `.github/workflows` handle everything automatically:
- `fetch.yml`: Runs every 6 hours.
- `deploy.yml`: Deploys the site when changes are pushed.

## Customization
- **Feeds**: Edit `backend/fetch.py` `FEEDS` list.
- **Keywords**: Edit `backend/fetch.py` `KEYWORDS`.
- **UI**: Modify `frontend/app/page.tsx` and `frontend/app/globals.css`.
