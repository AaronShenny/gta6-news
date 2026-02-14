import os
import json
import time
import feedparser
from datetime import datetime
from github import Github
from dotenv import load_dotenv
import re
from bs4 import BeautifulSoup
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
REPO_NAME = os.getenv("GITHUB_REPOSITORY")

# Initialize Gemini Client
client = None
if GEMINI_API_KEY:
    client = genai.Client(
    api_key=GEMINI_API_KEY,
    
    
    )
    for m in client.models.list():
        print(m.name)


# RSS Feeds
FEEDS = [
    "https://www.ign.com/rss/articles/feed?tags=grand-theft-auto-vi",
    "https://www.gamespot.com/feeds/game-news",
    "https://www.rockstargames.com/newswire/rss",
    "https://www.reddit.com/r/GTA6/top/.rss?t=day"
]

# Keywords
KEYWORDS = ["GTA 6", "Grand Theft Auto VI", "Vice City", "GTA VI"]

def clean_html(html_content):
    soup = BeautifulSoup(html_content, "html.parser")
    return soup.get_text(separator=" ")

def check_relevance(title, content):
    text = (title + " " + content).lower()
    return any(keyword.lower() in text for keyword in KEYWORDS)

def summarize_article(title, content, link):
    if not client:
        print("Skipping summarization (No API Key)")
        return None

    prompt = f"""
You are a professional gaming journalist. Summarize this article about GTA 6 for a dedicated news site.

Article Title: {title}
Article Content: {content[:8000]}
Source Link: {link}

Return ONLY valid JSON with this structure:
{{
    "title": "",
    "meta_description": "",
    "summary": "",
    "key_points": [],
    "faq": [],
    "tags": []
}}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                response_mime_type="application/json"
            )
        )

        raw_text = response.text.strip()

        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]

        return json.loads(raw_text)

    except Exception as e:
        print(f"Error summarising article: {e}")
        return None

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

    md_content = f"""---
title: "{data.get('title', '')}"
date: "{original_date.isoformat()}"
description: "{data.get('meta_description', '')}"
tags: {json.dumps(data.get('tags', []))}
source: "{data.get('source_link', '')}"
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

    print(f"Saved: {filepath}")
    return filepath

def main():
    seen_file = "backend/seen.json"

    if os.path.exists(seen_file):
        with open(seen_file, "r") as f:
            seen_urls = set(json.load(f))
    else:
        seen_urls = set()

    new_posts = []

    for feed_url in FEEDS:
        print(f"Checking feed: {feed_url}")

        try:
            feed = feedparser.parse(feed_url)

            for entry in feed.entries:
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
                    print(f"Relevant: {entry.title}")

                    summary_data = summarize_article(
                        entry.title,
                        clean_content,
                        entry.link
                    )

                    if summary_data:
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
            print(f"Error processing feed {feed_url}: {e}")

    os.makedirs("backend", exist_ok=True)
    with open(seen_file, "w") as f:
        json.dump(list(seen_urls), f, indent=2)

    # GitHub Commit
    if new_posts and GITHUB_TOKEN and REPO_NAME:
        print("Committing to GitHub...")

        try:
            g = Github(GITHUB_TOKEN)
            repo = g.get_repo(REPO_NAME)

            for post_path in new_posts:
                rel_path = os.path.relpath(post_path, os.getcwd()).replace("\\", "/")
                with open(post_path, "r", encoding="utf-8") as f:
                    content = f.read()

                repo.create_file(
                    rel_path,
                    f"Add post: {os.path.basename(post_path)}",
                    content,
                    branch="main"
                )

            print("Posts committed successfully.")

        except Exception as e:
            print(f"GitHub API Error: {e}")

if __name__ == "__main__":
    main()
