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
  const [selectedSheet, setSelectedSheet] = useState<{ type: 'custom' | 'default'; id: string; title: string } | null>(null);
  const { pop } = useNavigation();

  useEffect(() => {
    loadData();
  }, []);

  // If we have a query argument, try to find and copy immediately
  useEffect(() => {
    if (args?.query && !isLoading) {
      handleQuickCopy();
    }
  }, [args?.query, isLoading, customSheets, defaultSheets]);

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

  async function handleQuickCopy() {
    if (!args?.query) return;

    const query = args.query.toLowerCase();
    
    // Search in custom cheatsheets first
    const customMatch = customSheets.find(sheet =>
      sheet.title.toLowerCase().includes(query) ||
      sheet.content.toLowerCase().includes(query) ||
      sheet.tags?.some(tag => tag.toLowerCase().includes(query)) ||
      sheet.description?.toLowerCase().includes(query)
    );

    if (customMatch) {
      await copyCheatsheetContent('custom', customMatch.id, customMatch.title);
      return;
    }

    // Search in default cheatsheets
    const defaultMatch = defaultSheets.find(sheet =>
      sheet.toLowerCase().includes(query)
    );

    if (defaultMatch) {
      await copyCheatsheetContent('default', defaultMatch, defaultMatch);
      return;
    }

    // No exact match found, show toast
    showToast({
      style: Toast.Style.Failure,
      title: "Not Found",
      message: `No cheatsheet found matching "${args.query}"`
    });
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

  // If we have arguments and are loading, show loading state
  if (args?.query && isLoading) {
    return (
      <Form
        isLoading={true}
        actions={
          <ActionPanel>
            <Action title="Loading..." icon={Icon.Clock} />
          </ActionPanel>
        }
      >
        <Form.Description text={`Searching for "${args.query}"...`} />
      </Form>
    );
  }

  // If we have arguments and found a match, show success
  if (args?.query && !isLoading) {
    return (
      <Form
        actions={
          <ActionPanel>
            <Action title="Done" icon={Icon.Checkmark} onAction={pop} />
          </ActionPanel>
        }
      >
        <Form.Description text={`"${args.query}" copied to clipboard!`} />
      </Form>
    );
  }

  // Default interface for when no arguments are provided
  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Copy Cheatsheet" icon={Icon.CopyClipboard} onAction={() => {
            if (selectedSheet) {
              copyCheatsheetContent(selectedSheet.type, selectedSheet.id, selectedSheet.title);
            }
          }} />
          <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={loadData} />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="type"
        title="Cheatsheet Type"
        value={filterType}
        onChange={(value) => setFilterType(value as 'all' | 'custom' | 'default')}
      >
        <Form.Dropdown.Item title="All Types" value="all" icon={Icon.List} />
        <Form.Dropdown.Item title="Custom Only" value="custom" icon={Icon.Document} />
        <Form.Dropdown.Item title="Default Only" value="default" icon={Icon.Globe} />
      </Form.Dropdown>

      <Form.Dropdown
        id="sheet"
        title="Select Cheatsheet"
        value={selectedSheet?.id || ''}
        onChange={(value) => {
          const [type, id] = value.split('|');
          if (type === 'custom') {
            const sheet = customSheets.find(s => s.id === id);
            if (sheet) {
              setSelectedSheet({
                type: 'custom',
                id: sheet.id,
                title: sheet.title
              });
            }
          } else {
            setSelectedSheet({
              type: 'default',
              id: id,
              title: id
            });
          }
        }}
      >
        {filterType === 'all' || filterType === 'custom' ? (
          customSheets.map((sheet) => (
            <Form.Dropdown.Item
              key={`custom|${sheet.id}`}
              title={sheet.title}
              value={`custom|${sheet.id}`}
              icon={Icon.Document}
            />
          ))
        ) : null}
        
        {filterType === 'all' || filterType === 'default' ? (
          defaultSheets.map((sheet) => (
            <Form.Dropdown.Item
              key={`default|${sheet}`}
              title={sheet}
              value={`default|${sheet}`}
              icon={Icon.Globe}
            />
          ))
        ) : null}
      </Form.Dropdown>

      {selectedSheet && (
        <Form.Description text={`Selected: ${selectedSheet.title}`} />
      )}
    </Form>
  );
}
