import React from 'react';
import { List, ActionPanel, Action, Icon, showToast, Toast, useNavigation } from '@raycast/api';
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
  const { pop } = useNavigation();

  useEffect(() => {
    loadData();
  }, []);

  // Pre-fill search if argument provided
  useEffect(() => {
    if (args?.query) {
      setSearchQuery(args.query);
    }
  }, [args?.query]);

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

  const filteredCustomSheets = customSheets.filter(sheet =>
    filterType === 'all' || filterType === 'custom'
  ).filter(sheet =>
    searchQuery === '' || 
    sheet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sheet.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sheet.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    sheet.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDefaultSheets = defaultSheets.filter(sheet =>
    filterType === 'all' || filterType === 'default'
  ).filter(sheet =>
    searchQuery === '' || 
    sheet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search cheatsheets to copy..."
      searchText={searchQuery}
      onSearchTextChange={setSearchQuery}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by Type"
          value={filterType}
          onChange={(value) => setFilterType(value as 'all' | 'custom' | 'default')}
        >
          <List.Dropdown.Item title="All Types" value="all" icon={Icon.List} />
          <List.Dropdown.Item title="Custom Only" value="custom" icon={Icon.Document} />
          <List.Dropdown.Item title="Default Only" value="default" icon={Icon.Globe} />
        </List.Dropdown>
      }
      actions={
        <ActionPanel>
          <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={loadData} />
        </ActionPanel>
      }
    >
      {filteredCustomSheets.length === 0 && filteredDefaultSheets.length === 0 && !isLoading ? (
        <List.EmptyView
          icon={Icon.Document}
          title="No cheatsheets found"
          description={searchQuery ? `No cheatsheets match "${searchQuery}"` : "No cheatsheets available"}
        />
      ) : (
        <>
          {filteredCustomSheets.length > 0 && (
            <List.Section title="Custom Cheatsheets" subtitle={`${filteredCustomSheets.length} custom sheets`}>
              {filteredCustomSheets.map((sheet) => (
                <List.Item
                  key={sheet.id}
                  title={sheet.title}
                  subtitle={sheet.description || "No description"}
                  icon={Icon.Document}
                  accessories={[
                    { text: "Custom", icon: Icon.Tag },
                    { date: new Date(sheet.updatedAt) }
                  ]}
                  actions={
                    <ActionPanel>
                      <Action
                        title="Copy Content"
                        icon={Icon.CopyClipboard}
                        onAction={() => copyCheatsheetContent('custom', sheet.id, sheet.title)}
                      />
                      <Action.CopyToClipboard
                        title="Copy Title"
                        content={sheet.title}
                        icon={Icon.CopyClipboard}
                      />
                    </ActionPanel>
                  }
                />
              ))}
            </List.Section>
          )}

          {filteredDefaultSheets.length > 0 && (
            <List.Section title="Default Cheatsheets" subtitle={`${filteredDefaultSheets.length} default sheets`}>
              {filteredDefaultSheets.map((sheet) => (
                <List.Item
                  key={sheet}
                  title={sheet}
                  subtitle="From online sources"
                  icon={Icon.Globe}
                  accessories={[
                    { text: "Default", icon: Icon.Globe }
                  ]}
                  actions={
                    <ActionPanel>
                      <Action
                        title="Copy Content"
                        icon={Icon.CopyClipboard}
                        onAction={() => copyCheatsheetContent('default', sheet, sheet)}
                      />
                      <Action.CopyToClipboard
                        title="Copy Title"
                        content={sheet}
                        icon={Icon.CopyClipboard}
                      />
                    </ActionPanel>
                  }
                />
              ))}
            </List.Section>
          )}
        </>
      )}
    </List>
  );
}
