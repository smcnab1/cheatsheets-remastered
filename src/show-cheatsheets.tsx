import React from 'react';
import { Action, ActionPanel, Detail, Icon, List, Form, useNavigation, showToast, Toast, confirmAlert, Alert, LocalStorage } from '@raycast/api';
import { useEffect, useState } from 'react';
import { useFrecencySorting } from '@raycast/utils';

import Service, { CustomCheatsheet, Preferences, OfflineCheatsheet, FavoriteCheatsheet } from './service';
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

type FilterType = 'all' | 'custom' | 'default';

interface UnifiedCheatsheet {
  id: string;
  type: 'custom' | 'default';
  slug: string;
  title: string;
  isOffline: boolean;
  isFavorited: boolean;
}

function Command() {
  const [sheets, setSheets] = useState<string[]>([]);
  const [customSheets, setCustomSheets] = useState<CustomCheatsheet[]>([]);
  const [offlineSheets, setOfflineSheets] = useState<OfflineCheatsheet[]>([]);
  const [favorites, setFavorites] = useState<FavoriteCheatsheet[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);
      
      // Always try to fetch fresh data from online sources by default
      const [files, custom, offline, favs] = await Promise.all([
        Service.listFiles(),
        Service.getCustomCheatsheets(),
        Service.getOfflineCheatsheets(),
        Service.getFavorites()
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
      setFavorites(favs);
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

  // Create unified cheatsheet list
  const createUnifiedList = (): UnifiedCheatsheet[] => {
    const unified: UnifiedCheatsheet[] = [];
    
    // Add custom cheatsheets
    customSheets.forEach(sheet => {
      unified.push({
        id: sheet.id,
        type: 'custom',
        slug: sheet.id,
        title: sheet.title,
        isOffline: true, // Custom sheets are always "offline"
        isFavorited: favorites.some(fav => fav.slug === sheet.id && fav.type === 'custom')
      });
    });
    
    // Add online cheatsheets
    sheets.forEach(sheet => {
      const isOffline = offlineSheets.some(offline => offline.slug === sheet);
      unified.push({
        id: sheet,
        type: 'default',
        slug: sheet,
        title: sheet,
        isOffline,
        isFavorited: favorites.some(fav => fav.slug === sheet && fav.type === 'default')
      });
    });
    
    return unified;
  };

  const unifiedList = createUnifiedList();
  
  // Apply frequency sorting
  const { data: sortedData, visitItem } = useFrecencySorting(unifiedList, {
    namespace: 'cheatsheets',
    key: (item) => `${item.type}-${item.slug}`,
    sortUnvisited: (a, b) => {
      // Sort unvisited items: favorites first, then by type (custom first), then alphabetically
      if (a.isFavorited && !b.isFavorited) return -1;
      if (!a.isFavorited && b.isFavorited) return 1;
      if (a.type === 'custom' && b.type === 'default') return -1;
      if (a.type === 'default' && b.type === 'custom') return 1;
      return a.title.localeCompare(b.title);
    }
  });

  // Filter the sorted data
  const filteredData = sortedData.filter(item => {
    switch (filter) {
      case 'custom': return item.type === 'custom';
      case 'default': return item.type === 'default';
      default: return true;
    }
  });

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

  async function handleToggleFavorite(item: UnifiedCheatsheet) {
    try {
      const newFavorited = await Service.toggleFavorite(item.type, item.slug, item.title);
      
      // Update local state
      const updatedFavorites = await Service.getFavorites();
      setFavorites(updatedFavorites);
      
      // Update the item's favorite status
      item.isFavorited = newFavorited;
      
      showToast({
        style: Toast.Style.Success,
        title: newFavorited ? "Added to Favorites" : "Removed from Favorites",
        message: `"${item.title}" ${newFavorited ? 'is now' : 'is no longer'} favorited`
      });
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to update favorite status"
      });
    }
  }

  async function handleDownloadForOffline(slug: string) {
    try {
      const content = await Service.getSheet(slug);
      await Service.saveOfflineCheatsheet(slug, content);
      showToast({
        style: Toast.Style.Success,
        title: "Downloaded",
        message: `${slug} is now available offline`
      });
      // Reload offline data
      const updated = await Service.getOfflineCheatsheets();
      setOfflineSheets(updated);
      // Reload unified list
      await loadData();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Download Failed",
        message: `Failed to download ${slug}`
      });
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
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter Cheatsheets"
          value={filter}
          onChange={(value) => setFilter(value as FilterType)}
        >
          <List.Dropdown.Item title="All Cheatsheets" value="all" icon={Icon.List} />
          <List.Dropdown.Item title="Custom Cheatsheets" value="custom" icon={Icon.Document} />
          <List.Dropdown.Item title="Default Cheatsheets" value="default" icon={Icon.Globe} />
        </List.Dropdown>
      }
      actions={
        <ActionPanel>
          <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={handleRefresh} />
          <Action title="Create Custom Cheatsheet" icon={Icon.Plus} onAction={() => {}} />
          {Service.getPreferences().enableOfflineStorage && (
            <>
              <Action title="Download All for Offline" icon={Icon.Download} onAction={async () => {
                try {
                  const result = await Service.downloadAllForOffline();
                  await loadData();
                } catch (error) {
                  // Error already shown by service
                }
              }} />
            </>
          )}
        </ActionPanel>
      }
    >
      {filteredData.map((item) => (
        <List.Item
          key={item.id}
          title={item.title}
          subtitle={`${item.type === 'custom' ? 'Custom' : 'Default'}`}
          icon={item.type === 'custom' ? Icon.Document : getCheatsheetIcon(item.slug)}
          accessories={[
            { text: item.type === 'custom' ? 'Custom' : 'Default', icon: item.type === 'custom' ? Icon.Tag : Icon.Globe },
            ...(item.isOffline ? [{ icon: Icon.Checkmark, tooltip: "Available Offline" }] : []),
            ...(item.isFavorited ? [{ icon: Icon.Star, tooltip: "Favorited" }] : [])
          ]}
          actions={
            <ActionPanel>
              <ActionPanel.Section title="View">
                <Action.Push
                  title="Open Cheatsheet"
                  icon={Icon.Window}
                  target={
                    item.type === 'custom' 
                      ? <CustomSheetView sheet={customSheets.find(s => s.id === item.id)!} />
                      : <SheetView slug={item.slug} />
                  }
                />
                {item.type === 'default' && (
                  <Action.OpenInBrowser 
                    url={Service.urlFor(item.slug)}
                    title="Open in Browser"
                    icon={Icon.Link}
                  />
                )}
              </ActionPanel.Section>
              <ActionPanel.Section title="Actions">
                <Action
                  title={item.isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                  icon={item.isFavorited ? Icon.StarDisabled : Icon.Star}
                  onAction={() => handleToggleFavorite(item)}
                />
                <Action.CopyToClipboard
                  title="Copy Title"
                  content={item.title}
                  icon={Icon.CopyClipboard}
                />
                {item.type === 'custom' && (
                  <Action.Push
                    title="Edit Custom Cheatsheet"
                    icon={Icon.Pencil}
                    target={<EditCustomSheetForm sheet={customSheets.find(s => s.id === item.id)!} onUpdated={async () => {
                      const updated = await Service.getCustomCheatsheets();
                      setCustomSheets(updated);
                    }} />}
                  />
                )}
                {item.type === 'default' && Service.getPreferences().enableOfflineStorage && (
                  <Action
                    title={item.isOffline ? "Update Offline Copy" : "Download for Offline"}
                    icon={item.isOffline ? Icon.ArrowClockwise : Icon.Download}
                    onAction={() => handleDownloadForOffline(item.slug)}
                  />
                )}
              </ActionPanel.Section>
              {item.type === 'custom' && (
                <ActionPanel.Section title="Danger Zone">
                  <Action
                    title="Delete Custom Cheatsheet"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    onAction={() => handleDeleteCustomSheet(item.id, item.title)}
                  />
                </ActionPanel.Section>
              )}
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

function SheetView({ slug }: SheetProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSheet();
  }, [slug]);

  async function loadSheet() {
    try {
      setIsLoading(true);
      setError(null);
      const sheetContent = await Service.getSheet(slug);
      setContent(sheetContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cheatsheet');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <Detail markdown="Loading..." />;
  }

  if (error) {
    return (
      <Detail
        markdown={`# Error Loading Cheatsheet\n\n${error}\n\nPlease try refreshing or check your internet connection.`}
        actions={
          <ActionPanel>
            <Action title="Retry" icon={Icon.ArrowClockwise} onAction={loadSheet} />
          </ActionPanel>
        }
      />
    );
  }

  const processedContent = formatTables(stripTemplateTags(stripFrontmatter(content)));

  return (
    <Detail
      markdown={processedContent}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Actions">
            <Action.CopyToClipboard
              title="Copy Content"
              content={processedContent}
              icon={Icon.CopyClipboard}
            />
            <Action.CopyToClipboard
              title="Copy Title"
              content={slug}
              icon={Icon.CopyClipboard}
            />
            <Action.OpenInBrowser
              url={Service.urlFor(slug)}
              title="Open in Browser"
              icon={Icon.Link}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

interface CustomSheetProps {
  sheet: CustomCheatsheet;
}

function CustomSheetView({ sheet }: CustomSheetProps) {
  return (
    <Detail
      markdown={`# ${sheet.title}\n\n${sheet.content}`}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Actions">
            <Action.CopyToClipboard
              title="Copy Content"
              content={sheet.content}
              icon={Icon.CopyClipboard}
            />
            <Action.CopyToClipboard
              title="Copy Title"
              content={sheet.title}
              icon={Icon.CopyClipboard}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

interface EditCustomSheetProps {
  sheet: CustomCheatsheet;
  onUpdated: () => void;
}

function EditCustomSheetForm({ sheet, onUpdated }: EditCustomSheetProps) {
  const { pop } = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { value: title, updateValue: updateTitle, clearDraft: clearTitleDraft } = useDraftPersistence(
    `edit-custom-sheet-title-${sheet.id}`,
    sheet.title
  );
  
  const { value: content, updateValue: updateContent, clearDraft: clearContentDraft } = useDraftPersistence(
    `edit-custom-sheet-content-${sheet.id}`,
    sheet.content
  );
  
  const { value: tags, updateValue: updateTags, clearDraft: clearTagsDraft } = useDraftPersistence(
    `edit-custom-sheet-tags-${sheet.id}`,
    (sheet.tags || []).join(', ')
  );
  
  const { value: description, updateValue: updateDescription, clearDraft: clearDescriptionDraft } = useDraftPersistence(
    `edit-custom-sheet-description-${sheet.id}`,
    sheet.description || ''
  );

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      
      const tagsArray = values.tags ? values.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [];
      
      await Service.updateCustomCheatsheet(
        sheet.id,
        values.title,
        values.content,
        tagsArray,
        values.description
      );
      
      // Clear drafts after successful submission
      clearTitleDraft();
      clearContentDraft();
      clearTagsDraft();
      clearDescriptionDraft();
      
      onUpdated();
      pop();
      
      showToast({
        style: Toast.Style.Success,
        title: "Updated",
        message: `"${values.title}" has been modified`
      });
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to update cheatsheet"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      isLoading={isSubmitting}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Update Custom Cheatsheet"
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
        onChange={updateTitle}
        error={!title.trim() ? "Title is required" : undefined}
      />
      
      <Form.TextArea
        id="content"
        title="Content"
        placeholder="Enter cheatsheet content (Markdown supported)"
        value={content}
        onChange={updateContent}
        error={!content.trim() ? "Content is required" : undefined}
      />
      
      <Form.TextField
        id="tags"
        title="Tags"
        placeholder="Enter tags separated by commas"
        value={tags}
        onChange={updateTags}
      />
      
      <Form.TextField
        id="description"
        title="Description"
        placeholder="Enter optional description"
        value={description}
        onChange={updateDescription}
      />
    </Form>
  );
}

interface CreateCustomSheetProps {
  onCreated: () => void;
}

function CreateCustomSheetForm({ onCreated }: CreateCustomSheetProps) {
  const { pop } = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { value: title, updateValue: updateTitle, clearDraft: clearTitleDraft } = useDraftPersistence(
    'create-custom-sheet-title',
    ''
  );
  
  const { value: content, updateValue: updateContent, clearDraft: clearContentDraft } = useDraftPersistence(
    'create-custom-sheet-content',
    ''
  );
  
  const { value: tags, updateValue: updateTags, clearDraft: clearTagsDraft } = useDraftPersistence(
    'create-custom-sheet-tags',
    ''
  );
  
  const { value: description, updateValue: updateDescription, clearDraft: clearDescriptionDraft } = useDraftPersistence(
    'create-custom-sheet-description',
    ''
  );

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      
      const tagsArray = values.tags ? values.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [];
      
      await Service.createCustomCheatsheet(
        values.title,
        values.content,
        tagsArray,
        values.description
      );
      
      // Clear drafts after successful submission
      clearTitleDraft();
      clearContentDraft();
      clearTagsDraft();
      clearDescriptionDraft();
      
      onCreated();
      pop();
      
      showToast({
        style: Toast.Style.Success,
        title: "Created",
        message: `"${values.title}" has been added`
      });
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to create cheatsheet"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      isLoading={isSubmitting}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Create Custom Cheatsheet"
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
        onChange={updateTitle}
        error={!title.trim() ? "Title is required" : undefined}
      />
      
      <Form.TextArea
        id="content"
        title="Content"
        placeholder="Enter cheatsheet content (Markdown supported)"
        value={content}
        onChange={updateContent}
        error={!content.trim() ? "Content is required" : undefined}
      />
      
      <Form.TextField
        id="tags"
        title="Tags"
        placeholder="Enter tags separated by commas"
        value={tags}
        onChange={updateTags}
      />
      
      <Form.TextField
        id="description"
        title="Description"
        placeholder="Enter optional description"
        value={description}
        onChange={updateDescription}
      />
    </Form>
  );
}

export { EditCustomSheetForm, CustomSheetView };
export default Command;