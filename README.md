# Alois Carrera's Resume

Professional resume in JSON Resume format, created and managed using jsonresume/resume-cli.

## Description

The project is used to generate and manage a professional resume. It uses the JSON Resume format and the jsonresume/resume-cli tool. The resume is styled with the StackOverflow theme.

## Installation

To install the project, you need to have Node.js and npm installed on your machine. Once you have these prerequisites, you can clone the repository and install the dependencies using the following commands:

```sh
git clone https://github.com/AloisCRR/resume.git
cd resume
npm install
```

## Usage

The project provides several npm scripts for managing the resume:

- `npm start`: Serves the resume on a local server with live reloading.
- `npm run export`: Exports the resume to an HTML file.
- `npm run export-pdf`: Exports the resume to a PDF file.
- `npm run validate`: Validates the resume JSON against the JSON Resume schema.
- `npm run update-html`: The script updates or adds specific meta tags, the title, and the favicon link in the HTML file based on the resume data.

## Dependencies

The project uses the following npm packages:

- `jsdom`: A JavaScript implementation of the WHATWG DOM and HTML standards, for use with Node.js.
- `jsonresume-theme-stackoverflow`: The StackOverflow theme for JSON Resume.
- `resume-cli`: The command line tool for JSON Resume.
