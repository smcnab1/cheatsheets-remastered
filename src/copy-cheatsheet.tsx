import React from 'react';
import { Form, ActionPanel, Action, Icon, showToast, Toast, useNavigation } from '@raycast/api';
import { useState, useEffect } from 'react';
import Service, { CustomCheatsheet } from './service';

interface CopyCheatsheetProps {
  arguments?: {
    query?: string;
    type?: 'custom' | 'default';
  };
}

export default function CopyCheatsheet({ arguments: args }: CopyCheatsheetProps) {
  const [searchQuery, setSearchQuery] = useState(args?.query || '');
  const [filterType, setFilterType] = useState<'all' | 'custom' | 'default'>(args?.type === 'custom' ? 'custom' : args?.type === 'default' ? 'default' : 'all');
  const [customSheets, setCustomSheets] = useState<CustomCheatsheet[]>([]);
  const [defaultSheets, setDefaultSheets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Array<{ type: 'custom' | 'default'; id: string; title: string; matchType: string }>>([]);
  const { pop } = useNavigation();

  useEffect(() => {
    loadData();
  }, []);

  // Pre-fill search if argument provided
  useEffect(() => {
    if (args?.query) {
      setSearchQuery(args.query);
      performSearch(args.query);
    }
  }, [args?.query, customSheets, defaultSheets]);

  async function loadData() {
    try {
      setIsLoading(true);
      const [custom, defaultSheetsData] = await Promise.all([
        Service.getCustomCheatsheets(),
        Service.listFiles()
      ]);
      
      setCustomSheets(custom);
      if (defaultSheetsData.length > 0) {
        const sheets = getSheets(defaultSheetsData);
        setDefaultSheets(sheets);
      }
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to load cheatsheets"
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Helper function to get sheets from files
  function getSheets(files: any[]): string[] {
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

  function performSearch(query: string) {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results: Array<{ type: 'custom' | 'default'; id: string; title: string; matchType: string }> = [];
    const lowerQuery = query.toLowerCase();

    // Search in custom cheatsheets
    customSheets.forEach(sheet => {
      if (filterType === 'all' || filterType === 'custom') {
        if (sheet.title.toLowerCase().includes(lowerQuery)) {
          results.push({ type: 'custom', id: sheet.id, title: sheet.title, matchType: 'title' });
        } else if (sheet.content.toLowerCase().includes(lowerQuery)) {
          results.push({ type: 'custom', id: sheet.id, title: sheet.title, matchType: 'content' });
        } else if (sheet.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) {
          results.push({ type: 'custom', id: sheet.id, title: sheet.title, matchType: 'tag' });
        } else if (sheet.description?.toLowerCase().includes(lowerQuery)) {
          results.push({ type: 'custom', id: sheet.id, title: sheet.title, matchType: 'description' });
        }
      }
    });

    // Search in default cheatsheets
    if (filterType === 'all' || filterType === 'default') {
      defaultSheets.forEach(sheet => {
        if (sheet.toLowerCase().includes(lowerQuery)) {
          results.push({ type: 'default', id: sheet, title: sheet, matchType: 'title' });
        }
      });
    }

    // Remove duplicates and limit results
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => r.id === result.id)
    ).slice(0, 10);

    setSearchResults(uniqueResults);
  }

  async function copyCheatsheetContent(type: 'custom' | 'default', slug: string, title: string) {
    try {
      let content = '';
      
      if (type === 'custom') {
        const customSheet = customSheets.find(s => s.id === slug);
        content = customSheet?.content || '';
      } else {
        content = await Service.getSheet(slug);
      }

      if (content) {
        // Copy to clipboard
        await navigator.clipboard.writeText(content);
        
        showToast({
          style: Toast.Style.Success,
          title: "Copied to Clipboard",
          message: `"${title}" content has been copied`
        });
        
        pop();
      } else {
        throw new Error('No content found');
      }
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Copy Failed",
        message: `Failed to copy ${title}`
      });
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action title="Copy Selected" icon={Icon.CopyClipboard} onAction={() => {
            if (searchResults.length > 0) {
              const firstResult = searchResults[0];
              copyCheatsheetContent(firstResult.type, firstResult.id, firstResult.title);
            }
          }} />
          <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={loadData} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="search"
        title="Search Cheatsheets"
        placeholder="Type to search cheatsheets..."
        value={searchQuery}
        onChange={(value) => {
          setSearchQuery(value);
          performSearch(value);
        }}
      />

      <Form.Dropdown
        id="type"
        title="Filter by Type"
        value={filterType}
        onChange={(value) => {
          setFilterType(value as 'all' | 'custom' | 'default');
          if (searchQuery) {
            performSearch(searchQuery);
          }
        }}
      >
        <Form.Dropdown.Item title="All Types" value="all" icon={Icon.List} />
        <Form.Dropdown.Item title="Custom Only" value="custom" icon={Icon.Document} />
        <Form.Dropdown.Item title="Default Only" value="default" icon={Icon.Globe} />
      </Form.Dropdown>

      {searchQuery && (
        <Form.Description 
          text={`${searchResults.length} cheatsheet${searchResults.length !== 1 ? 's' : ''} found for "${searchQuery}"`} 
        />
      )}

      {searchResults.length > 0 && (
        <Form.Description 
          text="Press Cmd+Enter to copy the first result, or use the action panel to copy specific results."
        />
      )}

      {searchQuery && searchResults.length === 0 && !isLoading && (
        <Form.Description 
          text={`No cheatsheets found matching "${searchQuery}". Try a different search term.`}
        />
      )}

      {!searchQuery && (
        <Form.Description 
          text="Start typing to search for cheatsheets. Results will appear below."
        />
      )}
    </Form>
  );
}
