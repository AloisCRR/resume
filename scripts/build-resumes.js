const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const DirectusClient = require('./directus-client');
const DataTransformer = require('./data-transformer');

// Load environment variables from .env file (Node.js 20.6.0+)
if (process.loadEnvFile) {
  try {
    process.loadEnvFile('.env');
  } catch (error) {
    // Silently ignore if .env file doesn't exist (CI environment)
  }
}

class ResumeBuilder {
  constructor() {
    this.directusUrl = process.env.DIRECTUS_URL;
    this.directusToken = process.env.DIRECTUS_TOKEN;
    
    if (!this.directusUrl) {
      throw new Error('DIRECTUS_URL environment variable is required');
    }
    
    this.client = new DirectusClient(this.directusUrl, this.directusToken);
    this.transformer = new DataTransformer();
  }

  async buildAllResumes() {
    try {
      console.log('🚀 Starting resume build process...');
      
      // Get available languages
      const languages = await this.client.getAvailableLanguages();
      console.log(`📝 Found ${languages.length} languages: ${languages.join(', ')}`);
      
      // Ensure docs directory exists
      await this.ensureDirectory('docs');
      
      // Build resume for each language
      for (const lang of languages) {
        console.log(`\n🌍 Building resume for language: ${lang}`);
        await this.buildResumeForLanguage(lang);
      }
      
      console.log('\n✅ All resumes built successfully!');
    } catch (error) {
      console.error('❌ Error building resumes:', error);
      process.exit(1);
    }
  }

  async buildResumeForLanguage(language) {
    try {
      // Fetch data from Directus
      console.log(`📥 Fetching data for ${language}...`);
      const directusData = await this.client.getResumeData(language);
      
      // Transform to JSON Resume format
      console.log(`🔄 Transforming data for ${language}...`);
      const resumeData = this.transformer.transformToJSONResume(directusData);
      
      // Save JSON resume file
      const jsonFileName = language === 'en' ? 'resume.json' : `resume-${language}.json`;
      const jsonPath = path.join(process.cwd(), jsonFileName);
      await fs.writeFile(jsonPath, JSON.stringify(resumeData, null, 2));
      console.log(`💾 Saved ${jsonFileName}`);
      
      // Generate HTML
      console.log(`🎨 Generating HTML for ${language}...`);
      const htmlFileName = language === 'en' ? 'index.html' : `${language}.html`;
      const htmlPath = path.join('docs', htmlFileName);
      
      // Use resume-cli to export HTML
      const exportCommand = `npx resume export ${htmlPath} --theme stackoverflow --resume ${jsonFileName}`;
      execSync(exportCommand, { stdio: 'inherit' });
      
      // Update HTML with meta tags
      console.log(`🏷️  Updating meta tags for ${language}...`);
      await this.updateHtmlMetaTags(htmlPath, jsonFileName, language);
      
      console.log(`✅ Resume for ${language} completed: ${htmlPath}`);
    } catch (error) {
      console.error(`❌ Error building resume for ${language}:`, error);
      throw error;
    }
  }

  async updateHtmlMetaTags(htmlPath, resumeFileName, language) {
    const { execSync } = require('child_process');
    
    // Use the existing updateHtml.js script
    const updateCommand = `node updateHtml.js ${htmlPath} ${resumeFileName}`;
    execSync(updateCommand, { stdio: 'inherit' });
  }

  async ensureDirectory(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
}

// Run the builder if this file is executed directly
if (require.main === module) {
  const builder = new ResumeBuilder();
  builder.buildAllResumes().catch(console.error);
}

module.exports = ResumeBuilder;