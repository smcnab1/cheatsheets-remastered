/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** GitHub Token (optional) - Optional: Improves rate limits for online content search (local search doesn't require it) */
  "githubToken"?: string,
  /** Default Sort Order - How to sort cheatsheets by default */
  "defaultSort": "frecency" | "lastViewed" | "mostViewed" | "alpha"
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
  /** Preferences accessible in the `manage-repos` command */
  export type ManageRepos = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `show-cheatsheets` command */
  export type ShowCheatsheets = {}
  /** Arguments passed to the `create-custom-cheatsheet` command */
  export type CreateCustomCheatsheet = {}
  /** Arguments passed to the `manage-custom-cheatsheets` command */
  export type ManageCustomCheatsheets = {}
  /** Arguments passed to the `manage-repos` command */
  export type ManageRepos = {}
}

