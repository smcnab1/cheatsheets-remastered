import { Action, ActionPanel, Detail, Icon, List, Form, useNavigation } from '@raycast/api';
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
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [files, custom] = await Promise.all([
        Service.listFiles(),
        Service.getCustomCheatsheets()
      ]);
      
      const sheets = getSheets(files);
      setSheets(sheets);
      setCustomSheets(custom);
      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <List isLoading={isLoading}>
      <List.Section title="Custom Cheatsheets" subtitle={`${customSheets.length} custom sheets`}>
        {customSheets.map((sheet) => (
          <List.Item
            key={sheet.id}
            title={sheet.title}
            subtitle={`Custom • Created: ${new Date(sheet.createdAt).toLocaleDateString()}`}
            icon={Icon.Document}
            actions={
              <ActionPanel>
                <Action.Push
                  title="View Custom Cheatsheet"
                  icon={Icon.Window}
                  target={<CustomSheetView sheet={sheet} />}
                />
                <Action.Push
                  title="Edit Custom Cheatsheet"
                  icon={Icon.Pencil}
                  target={<EditCustomSheetForm sheet={sheet} onUpdated={() => {
                    Service.getCustomCheatsheets().then(setCustomSheets);
                  }} />}
                />
                <Action
                  title="Delete Custom Cheatsheet"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  onAction={async () => {
                    await Service.deleteCustomCheatsheet(sheet.id);
                    const updated = await Service.getCustomCheatsheets();
                    setCustomSheets(updated);
                  }}
                />
              </ActionPanel>
            }
          />
        ))}
        <List.Item
          title="Create New Custom Cheatsheet"
          subtitle="Add your own cheatsheet"
          icon={Icon.Plus}
          actions={
            <ActionPanel>
              <Action.Push
                title="Create New"
                icon={Icon.Plus}
                target={<CreateCustomSheetForm onCreated={() => {
                  Service.getCustomCheatsheets().then(setCustomSheets);
                }} />}
              />
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title="GitHub Cheatsheets" subtitle={`${sheets.length} sheets from devhints.io`}>
        {sheets.map((sheet) => (
          <List.Item
            actions={
              <ActionPanel>
                <Action.Push
                  title="Open Cheatsheet"
                  icon={Icon.Window}
                  target={<SheetView slug={sheet} />}
                />
                <Action.OpenInBrowser url={Service.urlFor(sheet)} />
              </ActionPanel>
            }
            key={sheet}
            title={sheet}
            subtitle="From devhints.io"
            icon={Icon.Globe}
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
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSheet() {
      const sheetMarkdown = await Service.getSheet(props.slug);
      const sheet = formatTables(
        stripTemplateTags(stripFrontmatter(sheetMarkdown)),
      );

      setSheet(sheet);
      setLoading(false);
    }

    fetchSheet();
  }, []);

  return <Detail isLoading={isLoading} markdown={sheet} />;
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
          <Action.SubmitForm title="Save Changes" onSubmit={handleSubmit} />
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

interface CreateCustomSheetFormProps {
  onCreated: () => void;
}

function CreateCustomSheetForm({ onCreated }: CreateCustomSheetFormProps) {
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

export default Command;