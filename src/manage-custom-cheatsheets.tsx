import React from 'react';
import { Action, ActionPanel, Detail, Icon, List, Form, useNavigation, confirmAlert, Alert } from '@raycast/api';
import { useEffect, useState } from 'react';
import Service, { CustomCheatsheet } from './service';

function Command() {
  const [customSheets, setCustomSheets] = useState<CustomCheatsheet[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomCheatsheets();
  }, []);

  async function loadCustomCheatsheets() {
    const sheets = await Service.getCustomCheatsheets();
    setCustomSheets(sheets);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const confirmed = await confirmAlert({
      title: "Delete Cheatsheet",
      message: "Are you sure you want to delete this custom cheatsheet?",
      primaryAction: {
        title: "Delete",
        style: Alert.ActionStyle.Destructive,
      },
    });

    if (confirmed) {
      await Service.deleteCustomCheatsheet(id);
      await loadCustomCheatsheets();
    }
  }

  return (
    <List isLoading={isLoading}>
      <List.Item
        title="Create New Cheatsheet"
        icon={Icon.Plus}
        actions={
          <ActionPanel>
            <Action.Push
              title="Create New"
              icon={Icon.Plus}
              target={<CreateCheatsheetForm onCreated={loadCustomCheatsheets} />}
            />
          </ActionPanel>
        }
      />
      {customSheets.map((sheet) => (
        <List.Item
          key={sheet.id}
          title={sheet.title}
          subtitle={`Created: ${new Date(sheet.createdAt).toLocaleDateString()}`}
          actions={
            <ActionPanel>
              <Action.Push
                title="View Cheatsheet"
                icon={Icon.Document}
                target={<CustomCheatsheetView sheet={sheet} />}
              />
              <Action.Push
                title="Edit Cheatsheet"
                icon={Icon.Pencil}
                target={<EditCheatsheetForm sheet={sheet} onUpdated={loadCustomCheatsheets} />}
              />
              <Action
                title="Delete Cheatsheet"
                icon={Icon.Trash}
                style={Action.Style.Destructive}
                onAction={() => handleDelete(sheet.id)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

interface CreateCheatsheetFormProps {
  onCreated: () => void;
}

function CreateCheatsheetForm({ onCreated }: CreateCheatsheetFormProps) {
  const { pop } = useNavigation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return;
    
    await Service.createCustomCheatsheet(title.trim(), content.trim());
    onCreated();
    pop();
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Cheatsheet" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="title"
        title="Title"
        placeholder="Enter cheatsheet title"
        value={title}
        onChange={setTitle}
      />
      <Form.TextArea
        id="content"
        title="Content"
        placeholder="Enter cheatsheet content (Markdown supported)"
        value={content}
        onChange={setContent}
      />
    </Form>
  );
}

interface EditCheatsheetFormProps {
  sheet: CustomCheatsheet;
  onUpdated: () => void;
}

function EditCheatsheetForm({ sheet, onUpdated }: EditCheatsheetFormProps) {
  const { pop } = useNavigation();
  const [title, setTitle] = useState(sheet.title);
  const [content, setContent] = useState(sheet.content);

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return;
    
    await Service.updateCustomCheatsheet(sheet.id, title.trim(), content.trim());
    onUpdated();
    pop();
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Update Cheatsheet" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="title"
        title="Title"
        placeholder="Enter cheatsheet title"
        value={title}
        onChange={setTitle}
      />
      <Form.TextArea
        id="content"
        title="Content"
        placeholder="Enter cheatsheet content (Markdown supported)"
        value={content}
        onChange={setContent}
      />
    </Form>
  );
}

interface CustomCheatsheetViewProps {
  sheet: CustomCheatsheet;
}

function CustomCheatsheetView({ sheet }: CustomCheatsheetViewProps) {
  return (
    <Detail
      markdown={sheet.content}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Title" text={sheet.title} />
          <Detail.Metadata.Label title="Created" text={new Date(sheet.createdAt).toLocaleString()} />
          <Detail.Metadata.Label title="Updated" text={new Date(sheet.updatedAt).toLocaleString()} />
        </Detail.Metadata>
      }
    />
  );
}

export default Command;
