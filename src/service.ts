import axios from 'axios';
import { LocalStorage } from '@raycast/api';

const BRANCH = 'master';
const OWNER = 'rstacruz';
const REPO = 'cheatsheets';

const listClient = axios.create({
  baseURL: `https://api.github.com/repos/${OWNER}/${REPO}/git/trees`,
});

const fileClient = axios.create({
  baseURL: `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`,
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
}

// Mock data for development
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
\`\`\``
};

class Service {
  static async listFiles(): Promise<File[]> {
    try {
      const response = await listClient.get<ListResponse>(`/${BRANCH}`);
      return response.data.tree;
    } catch (error) {
      console.warn('Failed to fetch from GitHub API, using mock data:', error);
      return mockFiles;
    }
  }

  static async getSheet(slug: string): Promise<string> {
    try {
      const response = await fileClient.get<string>(`/${slug}.md`);
      return response.data;
    } catch (error) {
      console.warn(`Failed to fetch sheet ${slug}, using mock data:`, error);
      return mockSheets[slug as keyof typeof mockSheets] || `# ${slug}\n\nContent not available.`;
    }
  }

  static urlFor(slug: string) {
    return `https://devhints.io/${slug}`;
  }

  // Custom cheatsheet methods
  static async getCustomCheatsheets(): Promise<CustomCheatsheet[]> {
    try {
      const customSheetsJson = await LocalStorage.getItem<string>('custom-cheatsheets');
      return customSheetsJson ? JSON.parse(customSheetsJson) : [];
    } catch (error) {
      console.warn('Failed to get custom cheatsheets:', error);
      return [];
    }
  }

  static async createCustomCheatsheet(title: string, content: string): Promise<CustomCheatsheet> {
    const customSheets = await this.getCustomCheatsheets();
    const newSheet: CustomCheatsheet = {
      id: `custom-${Date.now()}`,
      title,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    customSheets.push(newSheet);
    await LocalStorage.setItem('custom-cheatsheets', JSON.stringify(customSheets));
    return newSheet;
  }

  static async updateCustomCheatsheet(id: string, title: string, content: string): Promise<CustomCheatsheet | null> {
    const customSheets = await this.getCustomCheatsheets();
    const index = customSheets.findIndex(sheet => sheet.id === id);
    
    if (index === -1) return null;
    
    customSheets[index] = {
      ...customSheets[index],
      title,
      content,
      updatedAt: Date.now()
    };
    
    await LocalStorage.setItem('custom-cheatsheets', JSON.stringify(customSheets));
    return customSheets[index];
  }

  static async deleteCustomCheatsheet(id: string): Promise<boolean> {
    const customSheets = await this.getCustomCheatsheets();
    const filteredSheets = customSheets.filter(sheet => sheet.id !== id);
    
    if (filteredSheets.length === customSheets.length) return false;
    
    await LocalStorage.setItem('custom-cheatsheets', JSON.stringify(filteredSheets));
    return true;
  }

  static async getCustomCheatsheet(id: string): Promise<CustomCheatsheet | null> {
    const customSheets = await this.getCustomCheatsheets();
    return customSheets.find(sheet => sheet.id === id) || null;
  }
}

export default Service;
export type { File, CustomCheatsheet };