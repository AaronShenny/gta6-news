import os
import json
import time
import feedparser
import requests
import google.generativeai as genai
from datetime import datetime
from github import Github
from dotenv import load_dotenv
import re
from bs4 import BeautifulSoup
import html2text

# Load environment variables
load_dotenv()

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
REPO_NAME = os.getenv("GITHUB_REPOSITORY")  # e.g., "username/repo"

# RSS Feeds
FEEDS = [
    "https://www.ign.com/rss/articles/feed?tags=grand-theft-auto-vi",
    "https://www.gamespot.com/feeds/game-news",
    "https://www.rockstargames.com/newswire/rss",
    "https://www.reddit.com/r/GTA6/top/.rss?t=day" # Top posts from r/GTA6 daily
]

# Keywords to filter
KEYWORDS = ["GTA 6", "Grand Theft Auto VI", "Vice City", "GTA VI"]

# Initialize Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-pro')
1
def clean_html(html_content):
    soup = BeautifulSoup(html_content, "html.parser")
    return soup.get_text(separator=" ")

def check_relevance(title, content):
    text = (title + " " + content).lower()
    return any(keyword.lower() in text for keyword in KEYWORDS)

def summarize_article(title, content, link):
    if not GEMINI_API_KEY:
        print("Skipping summarization (No API Key)")
        return None

    prompt = f"""
    You are a professional gaming journalist. Summarize this article about GTA 6 for a dedicated news site.
    
    Article Title: {title}
    Article Content: {content[:8000]} # Truncate to avoid token limits
    Source Link: {link}

    Output must be a valid JSON object with the following schema:
    {{
        "title": "Engaging, SEO-friendly title",
        "meta_description": "SEO description (max 160 chars)",
        "summary": "A concise 2-3 paragraph summary of the news.",
        "key_points": ["Point 1", "Point 2", "Point 3"], # 3 key takeaways
        "faq": [
            {{"question": "Q1", "answer": "A1"}},
            {{"question": "Q2", "answer": "A2"}}
        ],
        "tags": ["GTA 6", "News", "Relevant Tag"]
    }}
    """
    
    try:
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        return json.loads(response.text)
    except Exception as e:
        print(f"Error summarising article: {e}")
        return None

def save_local_markdown(data, original_date):
    if not data:
        return None
    
    date_str = original_date.strftime("%Y-%m-%d")
    slug = re.sub(r'[^a-z0-9]+', '-', data['title'].lower()).strip('-')
    filename = f"{date_str}-{slug}.md"
    
    # Format Key Takeaways
    key_takeaways = "\n".join([f"- {point}" for point in data['key_points']])
    
    # Format FAQ
    faq_items = []
    for item in data['faq']:
        faq_items.append(f"**{item['question']}**\n{item['answer']}\n")
    faq_content = "\n".join(faq_items)
    
    # Construct Markdown content
    md_content = f"""---
title: "{data['title']}"
date: "{original_date.isoformat()}"
description: "{data['meta_description']}"
tags: {json.dumps(data['tags'])}
source: "{data.get('source_link', '')}"
---

# {data['title']}

{data['summary']}

## Key Takeaways
{key_takeaways}

## FAQ
{faq_content}

[Read full article]({data.get('source_link', '')})
"""
    
    # Ensure directory exists
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
                    content = entry.title # Fallback

                clean_content = clean_html(content)
                
                if check_relevance(entry.title, clean_content):
                    print(f"Found relevant article: {entry.title}")
                    
                    summary_data = summarize_article(entry.title, clean_content, entry.link)
                    if summary_data:
                        summary_data['source_link'] = entry.link
                        # Parse date
                        if hasattr(entry, 'published_parsed'):
                            dt = datetime.fromtimestamp(time.mktime(entry.published_parsed))
                        else:
                            dt = datetime.now()
                        
                        filepath = save_local_markdown(summary_data, dt)
                        if filepath:
                            seen_urls.add(entry.link)
                            new_posts.append(filepath)
                            
        except Exception as e:
            print(f"Error processing feed {feed_url}: {e}")

    # Update seen.json
    with open(seen_file, "w") as f:
        json.dump(list(seen_urls), f, indent=2)

    # Commit changes if in CI/CD and have new posts
    # For now, we rely on the git commands in the workflow or manual execution.
    # But if GITHUB_TOKEN is present, we could attempt to push?
    # The requirement says "Commit via GitHub API".
    
    if new_posts and GITHUB_TOKEN and REPO_NAME:
        print("Committing new posts to GitHub...")
        try:
            g = Github(GITHUB_TOKEN)
            repo = g.get_repo(REPO_NAME)
            
            for post_path in new_posts:
                rel_path = os.path.relpath(post_path, os.getcwd()).replace("\\", "/") # Ensure forward slashes
                with open(post_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                try:
                    repo.create_file(rel_path, f"Add post: {os.path.basename(post_path)}", content, branch="main")
                    print(f"Committed {rel_path}")
                except Exception as e:
                    print(f"Failed to commit {rel_path}: {e}")
                    
            # Also update seen.json
            with open(seen_file, 'r', encoding='utf-8') as f:
                seen_content = f.read()
            
            try:
                # We need to get the sha of seen.json to update it
                contents = repo.get_contents("backend/seen.json", ref="main")
                repo.update_file("backend/seen.json", "Update seen.json", seen_content, contents.sha, branch="main")
                print("Updated seen.json on GitHub")
            except Exception:
                # If it doesn't exist, create it
                repo.create_file("backend/seen.json", "Create seen.json", seen_content, branch="main")

        except Exception as e:
            print(f"GitHub API Error: {e}")

if __name__ == "__main__":
    main()
