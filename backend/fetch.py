import os
import json
import time
import feedparser
from datetime import datetime
from github import Github
from dotenv import load_dotenv
import re
import html2text
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from tenacity import retry, stop_after_attempt, wait_exponential
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
REPO_NAME = os.getenv("GITHUB_REPOSITORY")

# Free-tier protection
MAX_REQUESTS = 5

# Initialize Gemini Client
client = None
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

# RSS Feeds
FEEDS = [
    "https://www.ign.com/rss/articles/feed?tags=grand-theft-auto-vi",
    "https://www.gamespot.com/feeds/game-news",
    "https://www.rockstargames.com/newswire/rss",
    "https://www.reddit.com/r/GTA6/top/.rss?t=day"
]

# Keywords
KEYWORDS = ["GTA 6", "Grand Theft Auto VI", "Vice City", "GTA VI"]

class FAQItem(BaseModel):
    question: str
    answer: str

class ArticleSummary(BaseModel):
    title: str = Field(description="The catchy title of the article")
    meta_description: str = Field(description="A short meta description for SEO")
    summary: str = Field(description="A detailed summary of the article in markdown")
    key_points: list[str] = Field(description="A list of key takeaways")
    faq: list[FAQItem] = Field(description="A list of FAQ items generated from the article")
    tags: list[str] = Field(description="Relevant tags for the article")
    classification: str = Field(description="Classify the news as one of: CONFIRMED, RUMOR, LEAK, or UNKNOWN")

def clean_html(html_content):
    h = html2text.HTML2Text()
    h.ignore_links = False
    return h.handle(html_content)

def check_relevance(title, content):
    text = (title + " " + content).lower()
    return any(keyword.lower() in text for keyword in KEYWORDS)

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def summarize_article(title, content, link):
    if not client:
        logger.warning("Skipping summarization (No API Key)")
        return None

    prompt = f"""
You are a professional gaming journalist. Summarize this article about GTA 6 for a dedicated news site.

Article Title: {title}
Article Content: {content[:8000]}
Source Link: {link}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                response_mime_type="application/json",
                response_schema=ArticleSummary
            )
        )

        raw_text = response.text.strip()
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]

        return json.loads(raw_text.strip())

    except Exception as e:
        logger.error(f"Error summarising article: {e}")
        raise e

def save_local_markdown(data, original_date):
    if not data:
        return None

    date_str = original_date.strftime("%Y-%m-%d")
    slug = re.sub(r'[^a-z0-9]+', '-', data['title'].lower()).strip('-')
    filename = f"{date_str}-{slug}.md"

    key_takeaways = "\n".join([f"- {point}" for point in data.get("key_points", [])])

    faq_items = []
    for item in data.get("faq", []):
        question = item.get("question", "")
        answer = item.get("answer", "")
        faq_items.append(f"**{question}**\n{answer}\n")
    faq_content = "\n".join(faq_items)
    
    classification = data.get('classification', 'UNKNOWN')

    md_content = f"""---
title: "{data.get('title', '')}"
date: "{original_date.isoformat()}"
description: "{data.get('meta_description', '')}"
tags: {json.dumps(data.get('tags', []))}
source: "{data.get('source_link', '')}"
classification: "{classification}"
---

# {data.get('title', '')}

{data.get('summary', '')}

## Key Takeaways
{key_takeaways}

## FAQ
{faq_content}

[Read full article]({data.get('source_link', '')})
"""

    output_dir = os.path.join("frontend", "content", "posts")
    os.makedirs(output_dir, exist_ok=True)

    filepath = os.path.join(output_dir, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(md_content)

    logger.info(f"Saved: {filepath}")
    return filepath

def main():
    seen_file = "backend/seen.json"
    request_count = 0

    if os.path.exists(seen_file):
        with open(seen_file, "r") as f:
            seen_urls = set(json.load(f))
    else:
        seen_urls = set()

    new_posts = []

    for feed_url in FEEDS:
        logger.info(f"Checking feed: {feed_url}")

        try:
            feed = feedparser.parse(feed_url)

            for entry in feed.entries:

                if request_count >= MAX_REQUESTS:
                    logger.warning("Reached max free-tier requests. Stopping.")
                    break

                if entry.link in seen_urls:
                    continue

                content = ""
                if 'content' in entry:
                    content = entry.content[0].value
                elif 'summary' in entry:
                    content = entry.summary
                else:
                    content = entry.title

                clean_content = clean_html(content)

                if check_relevance(entry.title, clean_content):
                    logger.info(f"Relevant: {entry.title}")

                    try:
                        summary_data = summarize_article(
                            entry.title,
                            clean_content,
                            entry.link
                        )

                        if summary_data:
                            request_count += 1
                            summary_data['source_link'] = entry.link

                            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                                dt = datetime.fromtimestamp(
                                    time.mktime(entry.published_parsed)
                                )
                            else:
                                dt = datetime.now()

                            filepath = save_local_markdown(summary_data, dt)

                            if filepath:
                                seen_urls.add(entry.link)
                                new_posts.append(filepath)
                    except Exception as e:
                        logger.error(f"Failed to summarize and save {entry.title}: {e}")

            if request_count >= MAX_REQUESTS:
                break

        except Exception as e:
            logger.error(f"Error processing feed {feed_url}: {e}")

    os.makedirs("backend", exist_ok=True)
    with open(seen_file, "w") as f:
        json.dump(list(seen_urls), f, indent=2)

    # -------------------------
    # GitHub Commit Section
    # -------------------------
    if GITHUB_TOKEN and REPO_NAME:
        logger.info("Committing to GitHub...")

        try:
            g = Github(GITHUB_TOKEN)
            repo = g.get_repo(REPO_NAME)

            # ---- Update or Create seen.json ----
            with open(seen_file, "r", encoding="utf-8") as f:
                seen_content = f.read()

            try:
                existing_seen = repo.get_contents(seen_file, ref="main")

                repo.update_file(
                    existing_seen.path,
                    "Update seen.json",
                    seen_content,
                    existing_seen.sha,
                    branch="main"
                )
                logger.info("seen.json updated.")

            except Exception:
                repo.create_file(
                    seen_file,
                    "Create seen.json",
                    seen_content,
                    branch="main"
                )
                logger.info("seen.json created.")

            # ---- Update or Create Posts ----
            for post_path in new_posts:
                rel_path = os.path.relpath(post_path, os.getcwd()).replace("\\", "/")

                with open(post_path, "r", encoding="utf-8") as f:
                    content = f.read()

                try:
                    existing_file = repo.get_contents(rel_path, ref="main")

                    if existing_file.decoded_content.decode("utf-8") != content:
                        repo.update_file(
                            existing_file.path,
                            f"Update post: {os.path.basename(post_path)}",
                            content,
                            existing_file.sha,
                            branch="main"
                        )
                        logger.info(f"Updated: {rel_path}")
                    else:
                        logger.info(f"No changes: {rel_path}")

                except Exception:
                    repo.create_file(
                        rel_path,
                        f"Add post: {os.path.basename(post_path)}",
                        content,
                        branch="main"
                    )
                    logger.info(f"Created: {rel_path}")

            logger.info("GitHub commit completed successfully.")

        except Exception as e:
            logger.error(f"GitHub API Error: {e}")

if __name__ == "__main__":
    main()