import React from 'react';
import { Form, ActionPanel, Action, Icon, showToast, Toast, LocalStorage } from '@raycast/api';
import { useState, useEffect } from 'react';

interface Preferences {
  enableOfflineStorage: boolean;
  updateFrequency: 'every-use' | 'weekly' | 'monthly' | 'never';
  lastUpdateCheck: number;
  autoUpdate: boolean;
}

export default function Preferences() {
  const [preferences, setPreferences] = useState<Preferences>({
    enableOfflineStorage: true,
    updateFrequency: 'weekly',
    lastUpdateCheck: Date.now(),
    autoUpdate: true
  });

  useEffect(() => {
    // Load preferences from storage
    LocalStorage.getItem<string>('cheatsheet-preferences').then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPreferences(parsed);
        } catch (error) {
          console.warn('Failed to parse stored preferences:', error);
        }
      }
    });
  }, []);

  const handleSubmit = async (values: Preferences) => {
    try {
      const newPrefs = {
        ...values,
        lastUpdateCheck: Date.now()
      };
      
      setPreferences(newPrefs);
      await LocalStorage.setItem('cheatsheet-preferences', JSON.stringify(newPrefs));
      
      showToast({
        style: Toast.Style.Success,
        title: "Preferences Saved",
        message: "Your settings have been updated"
      });
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to save preferences"
      });
    }
  };

  const updatePreference = (key: keyof Preferences, value: any) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    LocalStorage.setItem('cheatsheet-preferences', JSON.stringify(newPrefs));
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm 
            title="Save Preferences" 
            onSubmit={handleSubmit}
            icon={Icon.Document}
          />
        </ActionPanel>
      }
    >
      <Form.Description
        text="Offline Storage"
        title="Manage how DevHints cheatsheets are stored locally"
      />
      
      <Form.Checkbox
        id="enableOfflineStorage"
        title="Enable Offline Storage"
        label="Store DevHints cheatsheets locally for offline access"
        value={preferences.enableOfflineStorage}
        onChange={(value) => updatePreference('enableOfflineStorage', value)}
      />
      
      <Form.Checkbox
        id="autoUpdate"
        title="Auto Update"
        label="Automatically check for updates based on frequency"
        value={preferences.autoUpdate}
        onChange={(value) => updatePreference('autoUpdate', value)}
      />

      <Form.Description
        text="Update Frequency"
        title="How often to check for new cheatsheets"
      />
      
      <Form.Dropdown
        id="updateFrequency"
        title="Update Frequency"
        value={preferences.updateFrequency}
        onChange={(value) => updatePreference('updateFrequency', value)}
      >
        <Form.Dropdown.Item value="every-use" title="Every Use" icon={Icon.ArrowClockwise} />
        <Form.Dropdown.Item value="weekly" title="Once a Week" icon={Icon.Calendar} />
        <Form.Dropdown.Item value="monthly" title="Once a Month" icon={Icon.Calendar} />
        <Form.Dropdown.Item value="never" title="Never" icon={Icon.XmarkCircle} />
      </Form.Dropdown>

      <Form.Description
        text="Status"
        title="Current offline storage information"
      />
      
      <Form.Description
        text={`Last Update Check: ${new Date(preferences.lastUpdateCheck).toLocaleString()}`}
      />
      <Form.Description
        text={`Offline Storage: ${preferences.enableOfflineStorage ? 'Enabled' : 'Disabled'}`}
      />
      <Form.Description
        text={`Auto Update: ${preferences.autoUpdate ? 'Enabled' : 'Disabled'}`}
      />
      <Form.Description
        text={`Update Frequency: ${preferences.updateFrequency.replace('-', ' ')}`}
      />
    </Form>
  );
}
