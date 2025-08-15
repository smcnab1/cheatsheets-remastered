/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Enable Offline Storage - Store online cheatsheets locally for offline access */
  "enableOfflineStorage": boolean,
  /** Auto Update - Automatically check for updates based on frequency */
  "autoUpdate": boolean,
  /** Update Frequency - How often to check for new cheatsheets */
  "updateFrequency": "every-use" | "weekly" | "monthly" | "never"
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `show-cheatsheets` command */
  export type ShowCheatsheets = ExtensionPreferences & {}
  /** Preferences accessible in the `create-custom-cheatsheet` command */
  export type CreateCustomCheatsheet = ExtensionPreferences & {}
  /** Preferences accessible in the `manage-custom-cheatsheets` command */
  export type ManageCustomCheatsheets = ExtensionPreferences & {}
  /** Preferences accessible in the `copy-cheatsheet` command */
  export type CopyCheatsheet = ExtensionPreferences & {}
  /** Preferences accessible in the `search-cheatsheets` command */
  export type SearchCheatsheets = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `show-cheatsheets` command */
  export type ShowCheatsheets = {}
  /** Arguments passed to the `create-custom-cheatsheet` command */
  export type CreateCustomCheatsheet = {}
  /** Arguments passed to the `manage-custom-cheatsheets` command */
  export type ManageCustomCheatsheets = {}
  /** Arguments passed to the `copy-cheatsheet` command */
  export type CopyCheatsheet = {}
  /** Arguments passed to the `search-cheatsheets` command */
  export type SearchCheatsheets = {}
}

