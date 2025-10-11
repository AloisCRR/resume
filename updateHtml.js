const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const htmlFilePath = process.argv[2] || './docs/index.html';
const resumeFilePath = process.argv[3] || 'resume.json';

// Read resume.json
let resumeData;

try {
    const jsonData = fs.readFileSync(resumeFilePath, 'utf8');

    resumeData = JSON.parse(jsonData);
} catch (err) {
    console.error("Error reading or parsing resume.json:", err);

    process.exit(1);
}

fs.readFile(htmlFilePath, 'utf8', function (err, html) {
    if (err) {
        throw err;
    }

    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Function to update or add meta tag
    function setMeta(name, content, attribute = 'name') {
        if (content) {
            let selector = attribute === 'charset' ? `meta[charset]` : `meta[${attribute}="${name}"]`;
            let element = document.querySelector(selector);
            if (element) {
                if (attribute !== 'charset') {  // 'charset' does not have a 'content' attribute
                    element.setAttribute('content', content);
                }
            } else {
                element = document.createElement('meta');
                if (attribute !== 'charset') {
                    element.setAttribute('content', content);
                }
                element.setAttribute(attribute, name);
                document.head.appendChild(element);
            }
        }
    }

    // Function to set title
    function setTitle(title) {
        if (title) {
            let titleElement = document.querySelector('title');
            if (titleElement) {
                titleElement.textContent = title;
            } else {
                titleElement = document.createElement('title');
                titleElement.textContent = title;
                document.head.appendChild(titleElement);
            }
        }
    }

    // Function to set link (for favicon)
    function setLink(rel, href, type) {
        let linkElement = document.querySelector(`link[rel="${rel}"]`);
        if (linkElement) {
            linkElement.setAttribute('href', href);
            linkElement.setAttribute('type', type);
        } else {
            linkElement = document.createElement('link');
            linkElement.setAttribute('rel', rel);
            linkElement.setAttribute('href', href);
            linkElement.setAttribute('type', type);
            document.head.appendChild(linkElement);
        }
    }

    const { label, name, summary, keywords } = resumeData.basics;
    const lang = resumeData.lang || 'en';

    // Dynamic URL generation based on language
    const baseUrl = 'https://aloiscrr.github.io/resume';
    const currentUrl = lang === 'en' ? baseUrl : `${baseUrl}/${lang}`;

    // Dynamic title prefix based on language
    const titlePrefixes = {
      'en': 'Resume | CV',
      'es': 'Currículum | CV',
      'fr': 'CV | Résumé',
      'de': 'Lebenslauf | CV',
      'pt': 'Currículo | CV',
      'it': 'CV | Resume',
      'nl': 'CV | Resume',
      'zh': '简历 | CV',
      'ja': '履歴書 | CV',
      'ko': '이력서 | CV'
    };
    const titlePrefix = titlePrefixes[lang] || 'Resume | CV';

    // Update or add meta tags dynamically
    setMeta('charset', 'UTF-8', 'charset'); // Special case for charset
    setMeta('viewport', 'width=device-width, initial-scale=1');
    setTitle(`${name} - ${label}`);
    setMeta('description', summary);
    
    // Use keywords from Directus, fallback to name + label if not available
    const metaKeywords = keywords || `${name}, ${label}`;
    setMeta('keywords', metaKeywords);
    
    setMeta('author', name);
    setMeta('robots', 'index, follow');
    setMeta('lang', lang);
    
    // Open Graph meta tags
    setMeta('og:title', `${titlePrefix} | ${name} | ${label}`, 'property');
    setMeta('og:description', summary, 'property');
    setMeta('og:image', 'https://i.postimg.cc/xfhFM5Yt/Alois-Carrera-Linked-In.jpg', 'property');
    setMeta('og:url', currentUrl, 'property');
    setMeta('og:locale', getOGLocale(lang), 'property');
    
    // Twitter Card meta tags
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', `${titlePrefix} | ${name} | ${label}`);
    setMeta('twitter:description', summary);
    setMeta('twitter:image', 'https://i.postimg.cc/xfhFM5Yt/Alois-Carrera-Linked-In.jpg');
    setMeta('twitter:site', '@aloiscrr');
    
    // Favicon
    setLink('icon', 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📝</text></svg>', 'image/x-icon');
    
    // Canonical link
    setLink('canonical', currentUrl);

    // Helper function to get Open Graph locale
    function getOGLocale(lang) {
        const locales = {
            'en': 'en_US',
            'es': 'es_ES',
            'fr': 'fr_FR',
            'de': 'de_DE',
            'pt': 'pt_PT',
            'it': 'it_IT',
            'nl': 'nl_NL',
            'zh': 'zh_CN',
            'ja': 'ja_JP',
            'ko': 'ko_KR'
        };
        return locales[lang] || 'en_US';
    }

    // Write the updated HTML back to the file
    fs.writeFile(htmlFilePath, dom.serialize(), function (err) {
        if (err) {
            throw err;
        }
        console.log(`Updated ${htmlFilePath} with dynamic meta tags for language: ${lang}`);
    });
});
