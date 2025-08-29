<!-- TOP ROW OF BADGES -->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://raycast.com/smcnab1/cheatsheets-remastered">
    <img src="assets/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Cheatsheets Remastered</h3>

  <p align="center">
    A remastered Cheatsheets extension with enhanced functionality, custom sheet creation, and an improved browsing experience.
    <br />
    <a href="https://www.raycast.com/smcnab1/cheatsheets-remastered"><strong>Install the extension »</strong></a>
    <br />
    <br />
    <a href="https://github.com/raycast/extensions/issues/new?title=%5BCheatsheets+Remastered%5D+...&template=extension_bug_report.yml&labels=extension%2Cbug&extension-url=https%3A%2F%2Fwww.raycast.com%2Fsmcnab1%2Fcheatsheets-remastered&body=%0A%3C%21--%0APlease+update+the+title+above+to+consisely+describe+the+issue%0A--%3E%0A%0A%23%23%23+Extension%0A%0Ahttps%3A%2F%2Fraycast.com%2F%23%7Bextension_path%28extension%29%7D%0A%0A%23%23%23+Description%0A%0A%3C%21--%0APlease+provide+a+clear+and+concise+description+of+what+the+bug+is.+Include+screenshots+if+needed.+Please+test+using+the+latest+version+of+the+extension%2C+Raycast+and+API.%0A--%3E%0A%0A%23%23%23+Steps+To+Reproduce%0A%0A%3C%21--%0AYour+bug+will+get+fixed+much+faster+if+the+extension+author+can+easily+reproduce+it.+Issues+without+reproduction+steps+may+be+immediately+closed+as+not+actionable.%0A--%3E%0A%0A1.+In+this+environment...%0A2.+With+this+config...%0A3.+Run+%27...%27%0A4.+See+error...%0A%0A%23%23%23+Current+Behavior%0A%0A%23%23%23+Expected+Behavior%0A%0A">Report Bug</a>
    ·
    <a href="https://github.com/raycast/extensions/issues/new?title=%5BCheatsheets+Remastered%5D+...&template=extension_feature_request.yml&labels=extension%2Cfeature%2Brequest&extension-url=https%3A%2F%2Fwww.raycast.com%2Fsmcnab1%2Fcheatsheets-remastered&body=%0A%3C%21--%0APlease+update+the+title+above+to+consisely+describe+the+issue%0A--%3E%0A%0A%23%23%23+Extension%0A%0A%23%7Brepository_url%28extension.latest_version%29%7D%0A%0A%23%23%23+Description%0A%0A%3C%21--%0ADescribe+the+feature+and+the+current+behavior%2Fstate.%0A--%3E%0A%0A%23%23%23+Who+will+benefit+from+this+feature%3F%0A%0A%23%23%23+Anything+else%3F%0A%0A%3C%21--%0ALinks%3F+References%3F+Anything+that+will+give+us+more+context%21%0ATip%3A+You+can+attach+images+or+log+files+by+clicking+this+area+to+highlight+it+and+then+dragging+files+in.%0A--%3E%0A%0A">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>

- [About The Project](#about-the-project)
  - [Features](#features)
  - [Built with](#built-with)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Install](#install)
  - [Usage](#usage)
- [Back Matter](#back-matter)
  - [Roadmap](#roadmap)
  - [Contributing](#contributing)
  - [License](#license)
  
</details>

<!-- ABOUT THE PROJECT -->
## About The Project
<div align="center">
  <a href="https://raycast.com/smcnab1/cheatsheets-remastered">
    <img src="metadata/cheatsheets-remastered-1.png" alt="Screenshot" width="100%" height="auto">
  </a>
  </div>
  
**Cheatsheets Remastered** is a modern [Raycast extension](https://github.com/raycast/extensions) to quickly search, create, and manage cheatsheets. It ships with curated [DevHints](https://devhints.io/) content and lets you keep your own sheets locally. Perfect for fast recall without leaving your keyboard.

### Features

- Search across custom and DevHints cheatsheets with fast filtering and tags
- Create, edit, copy, and organise markdown cheatsheets
- Local-first storage for your custom content.
- Large base of sheets integrated out of the box
- Rich tagging and favouriting with icon mapping for quick discovery

### Built with

- Raycast API
- TypeScript + React
- Node.js / npm

## Getting started

### Prerequisites

- macOS with Raycast installed

### Install

#### From Raycast Store (production):
Install via [Raycast Store](https://www.raycast.com/smcnab1/cheatsheet-remastered)

#### From source (development):

```bash
npm install
npm run dev
```

Build locally:

```bash
npm run build
```

### Commands

- Show Cheatsheets: browse all
- Create Custom Cheatsheet: compose new markdown
- Manage Custom Cheatsheets: edit, duplicate, delete, export
- Copy Cheatsheet: quick search and copy to clipboard


## Back Matter

<!-- CONTRIBUTING -->

<a name="contributing"></a>

### Contributing

Contributions welcome — especially to expand and improve the default cheatsheets.

- Add/Update default cheatsheets: edit markdown under `assets/cheatsheets/`
- Tag updates: map new tags in `src/default-tags.ts`
- Icons: add topic icons under `assets/` and optionally run `npm run normalize:icons`
- Bugs & ideas: [open an Issue](https://github.com/smcnab1/cheatsheets-remastered/issues)

PRs should briefly state:
- What changed and why
- Which cheatsheets were added/updated
- Any new tags introduced

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### License

This project is licensed under the [MIT License](LICENSE).

<!-- MARKDOWN LINKS & IMAGES -->

[contributors-shield]: https://img.shields.io/github/contributors/smcnab1/cheatsheets-remastered.svg?style=for-the-badge
[contributors-url]: https://github.com/smcnab1/cheatsheets-remastered/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/smcnab1/cheatsheets-remastered.svg?style=for-the-badge
[forks-url]: https://github.com/smcnab1/cheatsheets-remastered/network/members
[stars-shield]: https://img.shields.io/github/stars/smcnab1/cheatsheets-remastered.svg?style=for-the-badge
[stars-url]: https://github.com/smcnab1/cheatsheets-remastered/stargazers
[issues-shield]: https://img.shields.io/github/issues/smcnab1/cheatsheets-remastered.svg?style=for-the-badge
[issues-url]: https://github.com/smcnab1/cheatsheets-remastered/issues
[license-shield]: https://img.shields.io/github/license/smcnab1/cheatsheets-remastered.svg?style=for-the-badge
[license-url]: https://github.com/smcnab1/cheatsheets-remastered/blob/main/LICENSE
[product-screenshot]: metadata/cheatsheets-remastered-1.png
