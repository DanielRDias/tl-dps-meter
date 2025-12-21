#!/usr/bin/env python3
"""
Fetch player skill sets icons and data from questlog.gg
"""

import os
import json
import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = "https://questlog.gg/throne-and-liberty/en/db/skill-sets"
ASSETS_DIR = "src/assets/icons/skills"
OUTPUT_JSON = "src/assets/playerSkills.json"
MAX_PAGES = 8

def setup_driver():
    """Initialize Chrome driver with options"""
    chrome_options = Options()
    # Running visible browser since headless doesn't render properly
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--log-level=3")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def download_icon(icon_url, file_path):
    """Download an icon from URL to file path"""
    try:
        response = requests.get(icon_url, timeout=10)
        response.raise_for_status()
        
        with open(file_path, 'wb') as f:
            f.write(response.content)
        return True
    except Exception as e:
        print(f"  Error downloading icon: {e}")
        return False

def scrape_page(driver, page_num):
    """Scrape skills from a single page"""
    url = BASE_URL if page_num == 1 else f"{BASE_URL}?page={page_num}"
    print(f"\nFetching page {page_num}...")
    
    driver.get(url)
    
    # Wait for the page to load
    time.sleep(4)
    
    skills = []
    
    try:
        # Try to find table rows
        rows = driver.find_elements(By.XPATH, "//tbody/tr")
        if not rows:
            rows = driver.find_elements(By.CSS_SELECTOR, "tr")
        
        print(f"Found {len(rows)} rows")
        
        for row in rows:
            try:
                # Get skill name from span
                name_elements = row.find_elements(By.TAG_NAME, "span")
                skill_name = None
                for elem in name_elements:
                    text = elem.text.strip()
                    if text and len(text) > 2 and not text.isdigit():
                        skill_name = text
                        break
                
                if not skill_name:
                    continue
                
                # Get icon
                img_elements = row.find_elements(By.TAG_NAME, "img")
                icon_url = img_elements[0].get_attribute("src") if img_elements else None
                
                # Get weapon and skill type from table cells
                cells = row.find_elements(By.TAG_NAME, "td")
                weapon = cells[1].text.strip() if len(cells) > 1 else ""
                skill_type = cells[2].text.strip() if len(cells) > 2 else ""
                level = cells[3].text.strip() if len(cells) > 3 else ""
                
                # Get skill link
                link_elements = row.find_elements(By.TAG_NAME, "a")
                skill_link = ""
                for link in link_elements:
                    href = link.get_attribute("href")
                    if href and "/db/skill/" in href:
                        skill_link = href
                        break
                
                if icon_url:
                    skills.append({
                        'name': skill_name,
                        'icon_url': icon_url,
                        'weapon': weapon,
                        'type': skill_type,
                        'level': level,
                        'questlog_url': skill_link
                    })
                    print(f"  Found: {skill_name} ({weapon} - {skill_type})")
                    
            except Exception as e:
                # Silently skip rows that fail to parse
                continue
                
    except Exception as e:
        print(f"  Error finding rows: {e}")
    
    return skills

def main():
    """Main function to scrape all pages"""
    # Create assets directory
    os.makedirs(ASSETS_DIR, exist_ok=True)
    print(f"Assets directory: {ASSETS_DIR}")
    
    # Initialize driver
    print("Starting Chrome driver...")
    driver = setup_driver()
    
    all_skills = {}
    
    try:
        for page in range(1, MAX_PAGES + 1):
            skills = scrape_page(driver, page)
            
            for skill in skills:
                skill_name = skill['name']
                icon_url = skill['icon_url']
                
                # Download icon
                icon_filename = skill_name.replace('/', '_').replace('\\', '_').replace(':', '_')
                icon_filename = icon_filename.replace('"', '_').replace('?', '_').replace('*', '_')
                icon_filename = icon_filename.replace('<', '_').replace('>', '_').replace('|', '_')
                icon_filename = icon_filename.replace(' ', '-')
                
                # Determine file extension from URL
                ext = '.webp'
                if '.png' in icon_url.lower():
                    ext = '.png'
                elif '.jpg' in icon_url.lower() or '.jpeg' in icon_url.lower():
                    ext = '.jpg'
                
                icon_filename = f"{icon_filename}{ext}"
                icon_path = os.path.join(ASSETS_DIR, icon_filename)
                
                # Download if not exists
                if not os.path.exists(icon_path):
                    if download_icon(icon_url, icon_path):
                        print(f"  Downloaded: {skill_name}")
                    else:
                        print(f"  Failed: {skill_name}")
                else:
                    print(f"  Already exists: {skill_name}")
                
                # Add to collection (use weapon + name as key to handle duplicates across weapons)
                key = f"{skill['weapon']}_{skill_name}"
                if key not in all_skills:
                    all_skills[key] = {
                        'name': skill_name,
                        'icon': f"icons/skills/{icon_filename}",
                        'weapon': skill['weapon'],
                        'type': skill['type'],
                        'level': skill['level'],
                        'questlogUrl': skill['questlog_url'],
                        'iconUrl': icon_url
                    }
            
            time.sleep(0.5)  # Be respectful to the server
            
    finally:
        print("\nClosing browser...")
        driver.quit()
    
    # Save JSON
    print(f"\nSaving JSON file with {len(all_skills)} skills...")
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(all_skills, f, indent=2, ensure_ascii=False)
    
    print(f"\nComplete! Saved {len(all_skills)} player skills to {OUTPUT_JSON}")
    print(f"Icons saved to: {ASSETS_DIR}")

if __name__ == "__main__":
    main()
