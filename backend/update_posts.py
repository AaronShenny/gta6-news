import os
import re

def process_posts():
    posts_dir = os.path.join("frontend", "content", "posts")
    if not os.path.exists(posts_dir):
        print(f"Directory {posts_dir} does not exist.")
        return

    for filename in os.listdir(posts_dir):
        if not filename.endswith(".md"):
            continue

        filepath = os.path.join(posts_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        if "classification:" in content:
            continue
        
        parts = content.split("---")
        if len(parts) >= 3:
            frontmatter = parts[1]
            body = "---".join(parts[2:])
            
            # Simple heuristic since we don't have Gemini Key
            text = (frontmatter + body).lower()
            classification = "UNKNOWN"
            if any(word in text for word in ["rumor", "speculation", "theory", "concept", "hope"]):
                classification = "RUMOR"
            elif any(word in text for word in ["leak", "leaked", "insider"]):
                classification = "LEAK"
            elif any(word in text for word in ["confirmed", "official"]):
                classification = "CONFIRMED"
                
            new_frontmatter = frontmatter.rstrip() + f'\nclassification: "{classification}"\n'
            new_content = f"---{new_frontmatter}---{body}"
            
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"-> Classified {filename} as {classification}")

if __name__ == "__main__":
    process_posts()
