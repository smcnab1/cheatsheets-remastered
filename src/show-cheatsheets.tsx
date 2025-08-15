import React from 'react';
import { Action, ActionPanel, Detail, Icon, List, Form, useNavigation, showToast, Toast, confirmAlert, Alert } from '@raycast/api';
import { useEffect, useState } from 'react';

import Service, { CustomCheatsheet } from './service';
import {
  getSheets,
  stripFrontmatter,
  stripTemplateTags,
  formatTables,
} from './utils';

function Command() {
  const [sheets, setSheets] = useState<string[]>([]);
  const [customSheets, setCustomSheets] = useState<CustomCheatsheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);
      
      const [files, custom] = await Promise.all([
        Service.listFiles(),
        Service.getCustomCheatsheets()
      ]);
      
      const sheets = getSheets(files);
      setSheets(sheets);
      setCustomSheets(custom);
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

      <List.Section title="GitHub Cheatsheets" subtitle={`${sheets.length} sheets from devhints.io`}>
        {sheets.map((sheet) => (
          <List.Item
            key={sheet}
            title={sheet}
            subtitle="From devhints.io"
            icon={Icon.Globe}
            accessories={[
              { text: "GitHub", icon: Icon.Link },
              { icon: Icon.Link }
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
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
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
  const [title, setTitle] = useState(sheet.title);
  const [content, setContent] = useState(sheet.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        onChange={setTitle}
        error={title.trim() === '' ? "Title is required" : undefined}
      />
      <Form.TextArea
        id="content"
        title="Content"
        placeholder="Enter cheatsheet content (Markdown supported)"
        value={content}
        onChange={setContent}
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
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        onChange={setTitle}
        error={title.trim() === '' ? "Title is required" : undefined}
      />
      <Form.TextArea
        id="content"
        title="Content"
        placeholder="Enter cheatsheet content (Markdown supported)"
        value={content}
        onChange={setContent}
        error={content.trim() === '' ? "Content is required" : undefined}
      />
    </Form>
  );
}

export default Command;