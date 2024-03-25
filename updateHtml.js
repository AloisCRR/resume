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

    const { label, name, summary } = resumeData.basics;

    // Update or add your specific meta tags
    setMeta('charset', 'UTF-8', 'charset'); // Special case for charset
    setMeta('viewport', 'width=device-width, initial-scale=1');
    setTitle(`${name} - ${label}`);
    setMeta('description', summary);
    setMeta('keywords', `${name}, Software Engineer, Full Stack Engineer, Systems Design, React.js, TypeScript, Next.js, NestJS, Node.js, Elasticsearch, AWS Lambda, Agile Methodologies, Notion, GitHub Issues, Docker Products, Apache Kafka, AWS, Serverless Computing, Data Science, Solutions Architect, Eprezto, ESALab, EWEX, Universidad Tecnológica de Panamá, Software Development, IoT, CI/CD, GitHub Actions, AWS ECS`);
    setMeta('author', name);
    setMeta('robots', 'index, follow');
    setMeta('og:title', `Resume | CV | ${name} | ${label}`, 'property');
    setMeta('og:description', summary, 'property');
    setMeta('og:image', 'https://i.postimg.cc/SRLrpWnM/Alois-Carrera-Linked-In.jpg', 'property');
    setMeta('og:url', 'https://aloiscrr.github.io/resume/', 'property');
    setLink('icon', 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📝</text></svg>', 'image/x-icon');

    // Write the updated HTML back to the file
    fs.writeFile(htmlFilePath, dom.serialize(), function (err) {
        if (err) {
            throw err;
        }
        console.log('Updated index.html with new meta tags');
    });
});
