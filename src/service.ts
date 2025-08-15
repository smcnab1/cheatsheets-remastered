import axios from 'axios';
import { LocalStorage, showToast, Toast } from '@raycast/api';

const BRANCH = 'master';
const OWNER = 'rstacruz';
const REPO = 'cheatsheets';

interface Preferences {
  enableOfflineStorage: boolean;
  updateFrequency: 'every-use' | 'weekly' | 'monthly' | 'never';
  lastUpdateCheck: number;
  autoUpdate: boolean;
}

interface OfflineCheatsheet {
  slug: string;
  content: string;
  lastUpdated: number;
  size: number;
}

// Configure axios with better defaults and retry logic
const listClient = axios.create({
  baseURL: `https://api.github.com/repos/${OWNER}/${REPO}/git/trees`,
  timeout: 10000,
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Cheatsheets-Remastered-Raycast'
  }
});

const fileClient = axios.create({
  baseURL: `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`,
  timeout: 15000,
  headers: {
    'Accept': 'text/plain',
    'User-Agent': 'Cheatsheets-Remastered-Raycast'
  }
});

interface ListResponse {
  sha: string;
  url: string;
  tree: File[];
}

interface File {
  path: string;
  mode: string;
  type: 'tree' | 'blob';
  sha: string;
  size: number;
  url: string;
}

interface CustomCheatsheet {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  description?: string;
}

// Enhanced mock data for development
const mockFiles: File[] = [
  {
    path: 'javascript.md',
    mode: '100644',
    type: 'blob',
    sha: 'mock-sha-1',
    size: 1024,
    url: 'mock-url-1'
  },
  {
    path: 'python.md',
    mode: '100644',
    type: 'blob',
    sha: 'mock-sha-2',
    size: 2048,
    url: 'mock-url-2'
  },
  {
    path: 'git.md',
    mode: '100644',
    type: 'blob',
    sha: 'mock-sha-3',
    size: 1536,
    url: 'mock-url-3'
  },
  {
    path: 'docker.md',
    mode: '100644',
    type: 'blob',
    sha: 'mock-sha-4',
    size: 2048,
    url: 'mock-url-4'
  }
];

const mockSheets = {
  'javascript': `# JavaScript Cheatsheet

## Variables
\`\`\`javascript
let name = 'John';
const age = 30;
var oldWay = 'deprecated';
\`\`\`

## Functions
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

const arrowFunc = (name) => \`Hello, \${name}!\`;
\`\`\`

## Modern Features
\`\`\`javascript
// Destructuring
const { name, age } = person;

// Spread operator
const newArray = [...oldArray, newItem];

// Optional chaining
const value = obj?.prop?.subProp;
\`\`\``,
  'python': `# Python Cheatsheet

## Variables
\`\`\`python
name = "John"
age = 30
is_student = True
\`\`\`

## Functions
\`\`\`python
def greet(name):
    return f"Hello, {name}!"

lambda_func = lambda name: f"Hello, {name}!"
\`\`\`

## Data Structures
\`\`\`python
# List comprehension
squares = [x**2 for x in range(10)]

# Dictionary comprehension
word_counts = {word: text.count(word) for word in set(text.split())}
\`\`\``,
  'git': `# Git Cheatsheet

## Basic Commands
\`\`\`bash
git init
git add .
git commit -m "message"
git push origin main
\`\`\`

## Branching
\`\`\`bash
git branch feature-name
git checkout feature-name
git merge feature-name
\`\`\`

## Advanced
\`\`\`bash
# Stash changes
git stash
git stash pop

# Reset to previous commit
git reset --hard HEAD~1
\`\`\``,
  'docker': `# Docker Cheatsheet

## Basic Commands
\`\`\`bash
docker build -t image-name .
docker run -d -p 8080:80 image-name
docker ps
docker stop container-id
\`\`\`

## Docker Compose
\`\`\`yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "8000:8000"
\`\`\``
};

class Service {
  // Preferences management
  static async getPreferences(): Promise<Preferences> {
    try {
      const prefs = await LocalStorage.getItem<string>('cheatsheet-preferences');
      if (prefs) {
        return JSON.parse(prefs);
      }
    } catch (error) {
      console.warn('Failed to load preferences:', error);
    }
    
    // Default preferences
    return {
      enableOfflineStorage: true,
      updateFrequency: 'weekly',
      lastUpdateCheck: Date.now(),
      autoUpdate: true
    };
  }

  static async setPreferences(preferences: Preferences): Promise<void> {
    await LocalStorage.setItem('cheatsheet-preferences', JSON.stringify(preferences));
  }

  // Check if update is needed based on frequency
  static shouldUpdate(preferences: Preferences): boolean {
    if (!preferences.autoUpdate) return false;
    
    const now = Date.now();
    const lastCheck = preferences.lastUpdateCheck;
    
    switch (preferences.updateFrequency) {
      case 'every-use':
        return true;
      case 'weekly':
        return (now - lastCheck) > (7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return (now - lastCheck) > (30 * 24 * 60 * 60 * 1000);
      case 'never':
        return false;
      default:
        return false;
    }
  }

  // Offline storage management
  static async getOfflineCheatsheets(): Promise<OfflineCheatsheet[]> {
    try {
      const offlineData = await LocalStorage.getItem<string>('offline-cheatsheets');
      return offlineData ? JSON.parse(offlineData) : [];
    } catch (error) {
      console.warn('Failed to load offline cheatsheets:', error);
      return [];
    }
  }

  static async saveOfflineCheatsheet(slug: string, content: string): Promise<void> {
    try {
      const offlineSheets = await this.getOfflineCheatsheets();
      const existingIndex = offlineSheets.findIndex(sheet => sheet.slug === slug);
      
      const offlineSheet: OfflineCheatsheet = {
        slug,
        content,
        lastUpdated: Date.now(),
        size: content.length
      };
      
      if (existingIndex >= 0) {
        offlineSheets[existingIndex] = offlineSheet;
      } else {
        offlineSheets.push(offlineSheet);
      }
      
      await LocalStorage.setItem('offline-cheatsheets', JSON.stringify(offlineSheets));
    } catch (error) {
      console.error('Failed to save offline cheatsheet:', error);
      throw error;
    }
  }

  static async getOfflineCheatsheet(slug: string): Promise<OfflineCheatsheet | null> {
    try {
      const offlineSheets = await this.getOfflineCheatsheets();
      return offlineSheets.find(sheet => sheet.slug === slug) || null;
    } catch (error) {
      console.error('Failed to get offline cheatsheet:', error);
      return null;
    }
  }

  static async clearOfflineStorage(): Promise<void> {
    try {
      await LocalStorage.removeItem('offline-cheatsheets');
      showToast({
        style: Toast.Style.Success,
        title: "Cleared",
        message: "Offline storage has been cleared"
      });
    } catch (error) {
      console.error('Failed to clear offline storage:', error);
      throw error;
    }
  }

  // Enhanced list files with offline storage
  static async listFiles(): Promise<File[]> {
    try {
      const response = await listClient.get<ListResponse>(`/${BRANCH}`);
      return response.data.tree;
    } catch (error) {
      console.warn('Failed to fetch from GitHub API, using mock data:', error);
      
      // Show toast for network errors
      if (axios.isAxiosError(error) && error.code === 'ENOTFOUND') {
        showToast({
          style: Toast.Style.Failure,
          title: "Network Error",
          message: "Using offline data"
        });
      }
      
      return mockFiles;
    }
  }

  // Enhanced get sheet with offline storage
  static async getSheet(slug: string): Promise<string> {
    try {
      const preferences = await this.getPreferences();
      
      // Check offline storage first if enabled
      if (preferences.enableOfflineStorage) {
        const offlineSheet = await this.getOfflineCheatsheet(slug);
        if (offlineSheet) {
          console.log(`Using offline version of ${slug}`);
          return offlineSheet.content;
        }
      }
      
      // Fetch from GitHub
      const response = await fileClient.get<string>(`/${slug}.md`);
      const content = response.data;
      
      // Save to offline storage if enabled
      if (preferences.enableOfflineStorage) {
        try {
          await this.saveOfflineCheatsheet(slug, content);
        } catch (error) {
          console.warn('Failed to save to offline storage:', error);
        }
      }
      
      return content;
    } catch (error) {
      console.warn(`Failed to fetch sheet ${slug}, trying offline storage:`, error);
      
      // Try offline storage as fallback
      const prefs = await this.getPreferences();
      if (prefs?.enableOfflineStorage) {
        const offlineSheet = await this.getOfflineCheatsheet(slug);
        if (offlineSheet) {
          showToast({
            style: Toast.Style.Failure,
            title: "Offline Mode",
            message: `Using cached data for ${slug}`
          });
          return offlineSheet.content;
        }
      }
      
      // Use mock data as last resort
      const mockContent = mockSheets[slug as keyof typeof mockSheets];
      if (mockContent) {
        showToast({
          style: Toast.Style.Failure,
          title: "Offline Mode",
          message: `Using mock data for ${slug}`
        });
        return mockContent;
      }
      
      return `# ${slug}\n\nContent not available. Please check your internet connection.`;
    }
  }

  // Bulk download for offline storage
  static async downloadAllForOffline(): Promise<{ success: number; failed: number }> {
    try {
      const preferences = await this.getPreferences();
      if (!preferences.enableOfflineStorage) {
        throw new Error('Offline storage is disabled');
      }
      
      showToast({
        style: Toast.Style.Animated,
        title: "Downloading",
        message: "Fetching all cheatsheets for offline use..."
      });
      
      const files = await this.listFiles();
      const sheets = getSheets(files);
      let success = 0;
      let failed = 0;
      
      for (const sheet of sheets) {
        try {
          const content = await this.getSheet(sheet);
          await this.saveOfflineCheatsheet(sheet, content);
          success++;
        } catch (error) {
          console.warn(`Failed to download ${sheet}:`, error);
          failed++;
        }
      }
      
      // Update preferences
      preferences.lastUpdateCheck = Date.now();
      await this.setPreferences(preferences);
      
      showToast({
        style: Toast.Style.Success,
        title: "Download Complete",
        message: `${success} cheatsheets downloaded, ${failed} failed`
      });
      
      return { success, failed };
    } catch (error) {
      console.error('Failed to download all cheatsheets:', error);
      showToast({
        style: Toast.Style.Failure,
        title: "Download Failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
      throw error;
    }
  }

  static urlFor(slug: string) {
    return `https://devhints.io/${slug}`;
  }

  // Enhanced custom cheatsheet methods with validation
  static async getCustomCheatsheets(): Promise<CustomCheatsheet[]> {
    try {
      const customSheetsJson = await LocalStorage.getItem<string>('custom-cheatsheets');
      const sheets = customSheetsJson ? JSON.parse(customSheetsJson) : [];
      
      // Validate and clean data
      return sheets.filter((sheet: any) => 
        sheet && 
        typeof sheet.id === 'string' && 
        typeof sheet.title === 'string' && 
        typeof sheet.content === 'string' &&
        typeof sheet.createdAt === 'number' &&
        typeof sheet.updatedAt === 'number'
      );
    } catch (error) {
      console.warn('Failed to get custom cheatsheets:', error);
      showToast({
        style: Toast.Style.Failure,
        title: "Storage Error",
        message: "Failed to load custom cheatsheets"
      });
      return [];
    }
  }

  static async createCustomCheatsheet(title: string, content: string, tags?: string[], description?: string): Promise<CustomCheatsheet> {
    try {
      // Validate input
      if (!title.trim() || !content.trim()) {
        throw new Error('Title and content are required');
      }

      const customSheets = await this.getCustomCheatsheets();
      const newSheet: CustomCheatsheet = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim(),
        content: content.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: tags?.filter(tag => tag.trim()),
        description: description?.trim()
      };
      
      customSheets.push(newSheet);
      await LocalStorage.setItem('custom-cheatsheets', JSON.stringify(customSheets));
      
      showToast({
        style: Toast.Style.Success,
        title: "Created",
        message: `"${title}" has been added`
      });
      
      return newSheet;
    } catch (error) {
      console.error('Failed to create custom cheatsheet:', error);
      throw error;
    }
  }

  static async updateCustomCheatsheet(id: string, title: string, content: string, tags?: string[], description?: string): Promise<CustomCheatsheet | null> {
    try {
      if (!title.trim() || !content.trim()) {
        throw new Error('Title and content are required');
      }

      const customSheets = await this.getCustomCheatsheets();
      const index = customSheets.findIndex(sheet => sheet.id === id);
      
      if (index === -1) return null;
      
      customSheets[index] = {
        ...customSheets[index],
        title: title.trim(),
        content: content.trim(),
        updatedAt: Date.now(),
        tags: tags?.filter(tag => tag.trim()),
        description: description?.trim()
      };
      
      await LocalStorage.setItem('custom-cheatsheets', JSON.stringify(customSheets));
      
      showToast({
        style: Toast.Style.Success,
        title: "Updated",
        message: `"${title}" has been modified`
      });
      
      return customSheets[index];
    } catch (error) {
      console.error('Failed to update custom cheatsheet:', error);
      throw error;
    }
  }

  static async deleteCustomCheatsheet(id: string): Promise<boolean> {
    try {
      const customSheets = await this.getCustomCheatsheets();
      const filteredSheets = customSheets.filter(sheet => sheet.id !== id);
      
      if (filteredSheets.length === customSheets.length) return false;
      
      await LocalStorage.setItem('custom-cheatsheets', JSON.stringify(filteredSheets));
      return true;
    } catch (error) {
      console.error('Failed to delete custom cheatsheet:', error);
      throw error;
    }
  }

  static async getCustomCheatsheet(id: string): Promise<CustomCheatsheet | null> {
    try {
      const customSheets = await this.getCustomCheatsheets();
      return customSheets.find(sheet => sheet.id === id) || null;
    } catch (error) {
      console.error('Failed to get custom cheatsheet:', error);
      return null;
    }
  }

  // Search functionality
  static async searchCustomCheatsheets(query: string): Promise<CustomCheatsheet[]> {
    try {
      const customSheets = await this.getCustomCheatsheets();
      const lowerQuery = query.toLowerCase();
      
      return customSheets.filter(sheet => 
        sheet.title.toLowerCase().includes(lowerQuery) ||
        sheet.content.toLowerCase().includes(lowerQuery) ||
        sheet.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        sheet.description?.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Failed to search custom cheatsheets:', error);
      return [];
    }
  }

  // Backup and restore functionality
  static async exportCustomCheatsheets(): Promise<string> {
    try {
      const customSheets = await this.getCustomCheatsheets();
      return JSON.stringify(customSheets, null, 2);
    } catch (error) {
      console.error('Failed to export custom cheatsheets:', error);
      throw error;
    }
  }

  static async importCustomCheatsheets(jsonData: string): Promise<number> {
    try {
      const data = JSON.parse(jsonData);
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format');
      }

      // Validate each cheatsheet
      const validSheets = data.filter((sheet: any) => 
        sheet && 
        typeof sheet.title === 'string' && 
        typeof sheet.content === 'string'
      );

      if (validSheets.length === 0) {
        throw new Error('No valid cheatsheets found');
      }

      // Add import timestamp and generate new IDs
      const importedSheets = validSheets.map((sheet: any) => ({
        ...sheet,
        id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: sheet.createdAt || Date.now(),
        updatedAt: Date.now()
      }));

      const existingSheets = await this.getCustomCheatsheets();
      const allSheets = [...existingSheets, ...importedSheets];
      
      await LocalStorage.setItem('custom-cheatsheets', JSON.stringify(allSheets));
      
      showToast({
        style: Toast.Style.Success,
        title: "Imported",
        message: `${importedSheets.length} cheatsheets imported`
      });
      
      return importedSheets.length;
    } catch (error) {
      console.error('Failed to import custom cheatsheets:', error);
      throw error;
    }
  }
}

// Helper function to get sheets from files
function getSheets(files: File[]): string[] {
  return files
    .filter((file) => {
      const isDir = file.type === 'tree';
      const isMarkdown = file.path.endsWith('.md');
      const adminFiles = ['CONTRIBUTING', 'README', 'index', 'index@2016'];
      const isAdminFile = adminFiles.some(adminFile => file.path.startsWith(adminFile));
      return !isDir && isMarkdown && !isAdminFile;
    })
    .map((file) => file.path.replace('.md', ''));
}

export default Service;
export type { File, CustomCheatsheet, Preferences, OfflineCheatsheet };