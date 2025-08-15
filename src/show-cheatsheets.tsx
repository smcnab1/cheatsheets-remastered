import React from 'react';
import { Action, ActionPanel, Detail, Icon, List, Form, useNavigation, showToast, Toast, confirmAlert, Alert, LocalStorage } from '@raycast/api';
import { useEffect, useState } from 'react';

import Service, { CustomCheatsheet, Preferences, OfflineCheatsheet } from './service';
import {
  stripFrontmatter,
  stripTemplateTags,
  formatTables,
} from './utils';

// Icon mapping for different cheatsheet types
const getCheatsheetIcon = (slug: string): Icon => {
  const lowerSlug = slug.toLowerCase();
  
  if (lowerSlug.includes('javascript') || lowerSlug.includes('js')) return Icon.Code;
  if (lowerSlug.includes('python') || lowerSlug.includes('py')) return Icon.Terminal;
  if (lowerSlug.includes('git')) return Icon.Box;
  if (lowerSlug.includes('docker')) return Icon.Box;
  if (lowerSlug.includes('react') || lowerSlug.includes('vue') || lowerSlug.includes('angular')) return Icon.Window;
  if (lowerSlug.includes('sql') || lowerSlug.includes('database')) return Icon.Document;
  if (lowerSlug.includes('css') || lowerSlug.includes('html')) return Icon.Document;
  if (lowerSlug.includes('node') || lowerSlug.includes('npm')) return Icon.Gear;
  if (lowerSlug.includes('aws') || lowerSlug.includes('azure') || lowerSlug.includes('cloud')) return Icon.Cloud;
  if (lowerSlug.includes('linux') || lowerSlug.includes('bash') || lowerSlug.includes('shell')) return Icon.Terminal;
  if (lowerSlug.includes('vim') || lowerSlug.includes('emacs')) return Icon.Keyboard;
  
  return Icon.Document; // Default icon
};

// Custom hook for draft persistence
function useDraftPersistence(key: string, defaultValue: string) {
  const [value, setValue] = useState(defaultValue);
  const [draft, setDraft] = useState(defaultValue);

  useEffect(() => {
    // Load draft from storage
    LocalStorage.getItem<string>(key).then((stored) => {
      if (stored && stored !== defaultValue) {
        setValue(stored);
        setDraft(stored);
      }
    });
  }, [key, defaultValue]);

  const updateValue = (newValue: string) => {
    setValue(newValue);
    setDraft(newValue);
    // Save to storage
    LocalStorage.setItem(key, newValue);
  };

  const clearDraft = () => {
    LocalStorage.removeItem(key);
    setDraft(defaultValue);
  };

  return { value, updateValue, clearDraft };
}

function Command() {
  const [sheets, setSheets] = useState<string[]>([]);
  const [customSheets, setCustomSheets] = useState<CustomCheatsheet[]>([]);
  const [offlineSheets, setOfflineSheets] = useState<OfflineCheatsheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);
      
      // Always try to fetch fresh data from DevHints by default
      const [files, custom, offline] = await Promise.all([
        Service.listFiles(),
        Service.getCustomCheatsheets(),
        Service.getOfflineCheatsheets()
      ]);
      
      if (files.length > 0) {
        const sheets = getSheets(files);
        setSheets(sheets);
      } else if (offline.length > 0 && Service.getPreferences().enableOfflineStorage) {
        // Only use offline data if no fresh data available AND offline storage is enabled
        const offlineSlugs = offline.map(sheet => sheet.slug);
        setSheets(offlineSlugs);
      }
      
      setCustomSheets(custom);
      setOfflineSheets(offline);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cheatsheets');
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to load cheatsheets"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteCustomSheet(id: string, title: string) {
    const confirmed = await confirmAlert({
      title: "Delete Custom Cheatsheet",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      primaryAction: {
        title: "Delete",
        style: Alert.ActionStyle.Destructive,
      },
    });

    if (confirmed) {
      try {
        await Service.deleteCustomCheatsheet(id);
        const updated = await Service.getCustomCheatsheets();
        setCustomSheets(updated);
        
        showToast({
          style: Toast.Style.Success,
          title: "Deleted",
          message: `"${title}" has been removed`
        });
      } catch (err) {
        showToast({
          style: Toast.Style.Failure,
          title: "Error",
          message: "Failed to delete cheatsheet"
        });
      }
    }
  }

  async function handleRefresh() {
    await loadData();
    showToast({
      style: Toast.Style.Success,
      title: "Refreshed",
      message: "Cheatsheets updated"
    });
  }

  async function handleDownloadAll() {
    try {
      const result = await Service.downloadAllForOffline();
      // Reload data to show updated offline status
      await loadData();
    } catch (error) {
      // Error already shown by service
    }
  }

  async function handleClearOffline() {
    const confirmed = await confirmAlert({
      title: "Clear Offline Storage",
      message: "This will remove all locally stored DevHints cheatsheets. This action cannot be undone.",
      primaryAction: {
        title: "Clear All",
        style: Alert.ActionStyle.Destructive,
      },
    });

    if (confirmed) {
      try {
        await Service.clearOfflineStorage();
        setOfflineSheets([]);
        // Reload data
        await loadData();
      } catch (error) {
        // Error already shown by service
      }
    }
  }

  if (error) {
    return (
      <Detail
        markdown={`# Error Loading Cheatsheets\n\n${error}\n\nPlease try refreshing or check your internet connection.`}
        actions={
          <ActionPanel>
            <Action title="Retry" icon={Icon.ArrowClockwise} onAction={loadData} />
            <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={handleRefresh} />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <List 
      isLoading={isLoading}
      searchBarPlaceholder="Search cheatsheets..."
      actions={
        <ActionPanel>
          <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={handleRefresh} />
          <Action title="Create Custom Cheatsheet" icon={Icon.Plus} onAction={() => {}} />
          {Service.getPreferences().enableOfflineStorage && (
            <>
              <Action title="Download All for Offline" icon={Icon.Download} onAction={handleDownloadAll} />
              <Action title="Clear Offline Storage" icon={Icon.Trash} onAction={handleClearOffline} />
            </>
          )}
        </ActionPanel>
      }
    >
      <List.Section title="Custom Cheatsheets" subtitle={`${customSheets.length} custom sheets`}>
        {customSheets.map((sheet) => (
          <List.Item
            key={sheet.id}
            title={sheet.title}
            subtitle={`Custom • Created: ${new Date(sheet.createdAt).toLocaleDateString()}`}
            icon={Icon.Document}
            accessories={[
              { text: "Custom", icon: Icon.Tag },
              { date: new Date(sheet.updatedAt) }
            ]}
            actions={
              <ActionPanel>
                <ActionPanel.Section title="View & Edit">
                  <Action.Push
                    title="View Custom Cheatsheet"
                    icon={Icon.Window}
                    target={<CustomSheetView sheet={sheet} />}
                  />
                  <Action.Push
                    title="Edit Custom Cheatsheet"
                    icon={Icon.Pencil}
                    target={<EditCustomSheetForm sheet={sheet} onUpdated={async () => {
                      const updated = await Service.getCustomCheatsheets();
                      setCustomSheets(updated);
                    }} />}
                  />
                </ActionPanel.Section>
                <ActionPanel.Section title="Actions">
                  <Action
                    title="Delete Custom Cheatsheet"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    onAction={() => handleDeleteCustomSheet(sheet.id, sheet.title)}
                  />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        ))}
        <List.Item
          title="Create New Custom Cheatsheet"
          subtitle="Add your own cheatsheet"
          icon={Icon.Plus}
          accessories={[{ text: "New", icon: Icon.Star }]}
          actions={
            <ActionPanel>
              <Action.Push
                title="Create New"
                icon={Icon.Plus}
                target={<CreateCustomSheetForm onCreated={async () => {
                  const updated = await Service.getCustomCheatsheets();
                  setCustomSheets(updated);
                }} />}
              />
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title="DevHints Cheatsheets" subtitle={`${sheets.length} sheets from devhints.io`}>
        {sheets.map((sheet) => {
          const isOffline = offlineSheets.some(offline => offline.slug === sheet);
          const offlineSheet = offlineSheets.find(offline => offline.slug === sheet);
          
          return (
            <List.Item
              key={sheet}
              title={sheet}
              subtitle={`From DevHints${isOffline ? ' • Available Offline' : ''}`}
              icon={getCheatsheetIcon(sheet)}
              accessories={[
                { text: "DevHints", icon: Icon.Globe },
                ...(isOffline ? [
                  { text: "Offline", icon: Icon.Download },
                  { date: new Date(offlineSheet!.lastUpdated) }
                ] : [
                  { icon: Icon.Link }
                ])
              ]}
              actions={
                <ActionPanel>
                  <ActionPanel.Section title="View">
                    <Action.Push
                      title="Open Cheatsheet"
                      icon={Icon.Window}
                      target={<SheetView slug={sheet} />}
                    />
                    <Action.OpenInBrowser 
                      url={Service.urlFor(sheet)}
                      title="Open in Browser"
                      icon={Icon.Link}
                    />
                  </ActionPanel.Section>
                  <ActionPanel.Section title="Actions">
                    <Action.CopyToClipboard
                      title="Copy Title"
                      content={sheet}
                      icon={Icon.CopyClipboard}
                    />
                    {Service.getPreferences().enableOfflineStorage && (
                      <Action
                        title={isOffline ? "Update Offline Copy" : "Download for Offline"}
                        icon={isOffline ? Icon.ArrowClockwise : Icon.Download}
                        onAction={async () => {
                          try {
                            const content = await Service.getSheet(sheet);
                            await Service.saveOfflineCheatsheet(sheet, content);
                            showToast({
                              style: Toast.Style.Success,
                              title: "Downloaded",
                              message: `${sheet} is now available offline`
                            });
                            // Reload offline data
                            const updated = await Service.getOfflineCheatsheets();
                            setOfflineSheets(updated);
                          } catch (error) {
                            showToast({
                              style: Toast.Style.Failure,
                              title: "Download Failed",
                              message: `Failed to download ${sheet}`
                            });
                          }
                        }}
                      />
                    )}
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>

      {Service.getPreferences().enableOfflineStorage && offlineSheets.length > 0 && (
        <List.Section title="Offline Storage" subtitle={`${offlineSheets.length} sheets stored locally`}>
          <List.Item
            title="Offline Storage Info"
            subtitle={`${offlineSheets.length} cheatsheets available offline`}
            icon={Icon.Download}
            accessories={[
              { text: "Offline", icon: Icon.Download },
              { text: `${Math.round(offlineSheets.reduce((sum, sheet) => sum + sheet.size, 0) / 1024)} KB` }
            ]}
            actions={
              <ActionPanel>
                <Action title="Download All for Offline" icon={Icon.Download} onAction={handleDownloadAll} />
                <Action title="Clear Offline Storage" icon={Icon.Trash} onAction={handleClearOffline} />
              </ActionPanel>
            }
          />
        </List.Section>
      )}
    </List>
  );
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

interface SheetProps {
  slug: string;
}

function SheetView(props: SheetProps) {
  const [sheet, setSheet] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSheet() {
      try {
        setIsLoading(true);
        setError(null);
        
        const sheetMarkdown = await Service.getSheet(props.slug);
        const formattedSheet = formatTables(
          stripTemplateTags(stripFrontmatter(sheetMarkdown)),
        );

        setSheet(formattedSheet);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cheatsheet');
        showToast({
          style: Toast.Style.Failure,
          title: "Error",
          message: `Failed to load ${props.slug}`
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchSheet();
  }, [props.slug]);

  if (error) {
    return (
      <Detail
        markdown={`# Error Loading ${props.slug}\n\n${error}\n\nPlease try again or check your internet connection.`}
        actions={
          <ActionPanel>
            <Action title="Retry" icon={Icon.ArrowClockwise} onAction={() => window.location.reload()} />
            <Action.OpenInBrowser url={Service.urlFor(props.slug)} />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <Detail 
      isLoading={isLoading} 
      markdown={sheet}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={Service.urlFor(props.slug)} />
          <Action.CopyToClipboard title="Copy Content" content={sheet} />
        </ActionPanel>
      }
    />
  );
}

interface CustomSheetViewProps {
  sheet: CustomCheatsheet;
}

function CustomSheetView({ sheet }: CustomSheetViewProps) {
  return (
    <Detail
      markdown={sheet.content}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Title" text={sheet.title} />
          <Detail.Metadata.Label title="Type" text="Custom" />
          <Detail.Metadata.Label title="Created" text={new Date(sheet.createdAt).toLocaleString()} />
          <Detail.Metadata.Label title="Updated" text={new Date(sheet.updatedAt).toLocaleString()} />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Content" content={sheet.content} />
          <Action.CopyToClipboard title="Copy Title" content={sheet.title} />
        </ActionPanel>
      }
    />
  );
}

interface EditCustomSheetFormProps {
  sheet: CustomCheatsheet;
  onUpdated: () => void;
}

function EditCustomSheetForm({ sheet, onUpdated }: EditCustomSheetFormProps) {
  const { pop } = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { value: title, updateValue: updateTitle, clearDraft: clearTitleDraft } = useDraftPersistence(`edit-draft-title-${sheet.id}`, sheet.title);
  const { value: content, updateValue: updateContent, clearDraft: clearContentDraft } = useDraftPersistence(`edit-draft-content-${sheet.id}`, sheet.content);

  // Load draft data if available
  useEffect(() => {
    if (title !== sheet.title) updateTitle(title);
    if (content !== sheet.content) updateContent(content);
  }, [title, content, sheet.title, sheet.content]);

  // Save draft as user types
  const handleTitleChange = (value: string) => {
    updateTitle(value);
  };

  const handleContentChange = (value: string) => {
    updateContent(value);
  };

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "Validation Error",
        message: "Title and content are required"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await Service.updateCustomCheatsheet(sheet.id, title.trim(), content.trim());
      
      // Clear drafts after successful save
      clearTitleDraft();
      clearContentDraft();
      
      onUpdated();
      
      showToast({
        style: Toast.Style.Success,
        title: "Updated",
        message: `"${title}" has been updated`
      });
      
      pop();
    } catch (err) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to update cheatsheet"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form
      isLoading={isSubmitting}
      actions={
        <ActionPanel>
          <Action.SubmitForm 
            title="Save Changes" 
            onSubmit={handleSubmit}
            icon={Icon.Document}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="title"
        title="Title"
        placeholder="Enter cheatsheet title"
        value={title}
        onChange={handleTitleChange}
        error={title.trim() === '' ? "Title is required" : undefined}
      />
      <Form.TextArea
        id="content"
        title="Content"
        placeholder="Enter cheatsheet content (Markdown supported)"
        value={content}
        onChange={handleContentChange}
        error={content.trim() === '' ? "Content is required" : undefined}
      />
    </Form>
  );
}

interface CreateCustomSheetFormProps {
  onCreated: () => void;
}

function CreateCustomSheetForm({ onCreated }: CreateCustomSheetFormProps) {
  const { pop } = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { value: title, updateValue: updateTitle, clearDraft: clearTitleDraft } = useDraftPersistence('create-draft-title', '');
  const { value: content, updateValue: updateContent, clearDraft: clearContentDraft } = useDraftPersistence('create-draft-content', '');

  // Load draft data if available
  useEffect(() => {
    if (title) updateTitle(title);
    if (content) updateContent(content);
  }, [title, content]);

  // Save draft as user types
  const handleTitleChange = (value: string) => {
    updateTitle(value);
  };

  const handleContentChange = (value: string) => {
    updateContent(value);
  };

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "Validation Error",
        message: "Title and content are required"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await Service.createCustomCheatsheet(title.trim(), content.trim());
      
      // Clear drafts after successful creation
      clearTitleDraft();
      clearContentDraft();
      
      onCreated();
      
      showToast({
        style: Toast.Style.Success,
        title: "Created",
        message: `"${title}" has been created`
      });
      
      pop();
    } catch (err) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to create cheatsheet"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form
      isLoading={isSubmitting}
      actions={
        <ActionPanel>
          <Action.SubmitForm 
            title="Create Cheatsheet" 
            onSubmit={handleSubmit}
            icon={Icon.Plus}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="title"
        title="Title"
        placeholder="Enter cheatsheet title"
        value={title}
        onChange={handleTitleChange}
        error={title.trim() === '' ? "Title is required" : undefined}
      />
      <Form.TextArea
        id="content"
        title="Content"
        placeholder="Enter cheatsheet content (Markdown supported)"
        value={content}
        onChange={handleContentChange}
        error={content.trim() === '' ? "Content is required" : undefined}
      />
    </Form>
  );
}

export default Command;