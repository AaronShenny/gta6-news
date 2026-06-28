import os

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
        
        parts = content.split("---")
        if len(parts) >= 3:
            frontmatter = parts[1]
            body = "---".join(parts[2:])
            
            lines = frontmatter.split('\n')
            for i, line in enumerate(lines):
                if line.startswith('title: '):
                    title_val = line[7:].strip()
                    if title_val.startswith('"') and title_val.endswith('"'):
                        inner = title_val[1:-1]
                        inner_fixed = inner.replace('"', "'")
                        lines[i] = f'title: "{inner_fixed}"'
                if line.startswith('description: '):
                    desc_val = line[13:].strip()
                    if desc_val.startswith('"') and desc_val.endswith('"'):
                        inner = desc_val[1:-1]
                        inner_fixed = inner.replace('"', "'")
                        lines[i] = f'description: "{inner_fixed}"'
            
            new_frontmatter = '\n'.join(lines)
            new_content = f"---{new_frontmatter}---{body}"
            
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
    print("Fixed YAML frontmatter in all posts.")

if __name__ == "__main__":
    process_posts()
