class DataTransformer {
  transformToJSONResume(directusData) {
    const resume = {
      $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
      lang: directusData.lang || 'en',
      basics: this.transformBasics(directusData),
      work: this.transformWorkExperience(directusData.work_experience),
      projects: this.transformProjects(directusData.projects),
      // skills: this.transformSkills(directusData.skills),
      education: this.transformEducation(directusData.education),
      certificates: this.transformCertificates(directusData.certificates),
      awards: this.transformAwards(directusData.awards),
      languages: this.transformLanguages(directusData.languages)
    };

    return resume;
  }

  transformBasics(data) {
    // Parse location if it's a string, otherwise use as-is
    let location = data.location;

    if (typeof location === 'string') {
      // Try to parse location string into city, region, countryCode
      const parts = location.split(',').map(part => part.trim());

      location = {
        city: parts[0] || '',
        region: parts[1] || '',
        countryCode: parts[2] || 'PA' // Default to Panama
      };
    }

    const email = data?.links?.find(({ name }) => name === 'Email')?.link

    return {
      name: data.name || '',
      label: data.title || '',
      website: 'https://aloiscrr.dev',
      url: 'https://aloiscrr.dev',
      email: email?.replace('mailto:', ''),
      location: location,
      summary: data.summary || '',
      keywords: data.keywords || '',
      profiles: this.transformLinks(data.links)
    };
  }

  transformLinks(links) {
    if (!links || !Array.isArray(links)) return [];

    return links.map(link => ({
      network: link.name || '',
      username: this.extractUsername(link.link) || link.name || '',
      url: link.link || ''
    })).filter(
      ({ network }) => !(['Email', 'Resume'].includes(network))
    );
  }

  extractUsername(url) {
    if (!url) return '';

    try {
      const urlObj = new URL(url);
      // Extract username from common platforms
      if (urlObj.hostname.includes('linkedin.com')) {
        return urlObj.pathname.split('/').filter(Boolean)[1] || '';
      }
      if (urlObj.hostname.includes('github.com')) {
        return urlObj.pathname.split('/').filter(Boolean)[0] || '';
      }
      return urlObj.pathname.split('/').filter(Boolean).pop() || '';
    } catch {
      return '';
    }
  }

  transformWorkExperience(workExperience) {
    if (!workExperience || !Array.isArray(workExperience)) return [];

    return workExperience.map(item => {
      const exp = item.resume_work_experience_id;

      return {
        name: exp.company || '',
        position: exp.title || '',
        location: exp.location || '',
        startDate: this.formatDate(exp.start_date) || '',
        endDate: this.formatDate(exp.end_date) || '',
        // website: exp.website || '',
        url: exp.website || '',
        summary: exp.description || '',
        // highlights: this.transformResponsibilities(exp.responsibilities),
        keywords: this.transformTechUsed(exp.tech_used)
      };
    });
  }

  transformResponsibilities(responsibilities) {
    if (!responsibilities || !Array.isArray(responsibilities)) return [];

    return responsibilities.map(resp => resp.description || '').filter(Boolean);
  }

  transformTechUsed(techUsed) {
    if (!techUsed || !Array.isArray(techUsed)) return [];

    return techUsed.map(tech => tech.skills_id?.name || '').filter(Boolean);
  }

  transformProjects(projects) {
    if (!projects || !Array.isArray(projects)) return [];

    return projects.map(item => {
      const project = item.resume_projects_id;
      return {
        name: project.title || '',
        description: project.summary,
        startDate: this.formatDate(project.date) || '',
        endDate: this.formatDate(project.end_date) || '',
        url: project.website || '',
        // highlights: this.transformProjectFeatures(project.features),
        summary: project.summary,
        keywords: []
      };
    });
  }

  transformProjectFeatures(features) {
    if (!features || !Array.isArray(features)) return [];

    return features.map(feature =>
      feature.resume_project_features_id?.description || ''
    ).filter(Boolean);
  }

  transformSkills(skills) {
    if (!skills || !Array.isArray(skills)) return [];

    return skills.map(item => {
      const skill = item.resume_skills_id;
      return {
        name: skill.category || '',
        keywords: this.transformSkillNames(skill.skills)
      };
    });
  }

  transformSkillNames(skills) {
    if (!skills || !Array.isArray(skills)) return [];

    return skills.map(skill => skill.name || '').filter(Boolean);
  }

  transformEducation(education) {
    if (!education || !Array.isArray(education)) return [];

    return education.map(item => {
      const edu = item.resume_education_id;
      return {
        institution: edu.institution || '',
        area: edu.degree || '',
        // studyType: edu.degree || '',
        startDate: this.formatDate(edu.start_date) || '',
        endDate: this.formatDate(edu.end_date) || '',
        gpa: edu.score || '',
        score: edu.score || '',
        location: this.parseLocation(edu.location) || {},
        courses: [],
        summary: edu.focus
      };
    });
  }

  transformCertificates(certificates) {
    if (!certificates || !Array.isArray(certificates)) return [];

    return certificates.map(item => {
      const cert = item.resume_certificates_id;
      return {
        name: cert.title || '',
        issuer: cert.organization || '',
        date: this.formatDate(cert.date) || '',
        url: cert.link || ''
      };
    });
  }

  transformAwards(awards) {
    if (!awards || !Array.isArray(awards)) return [];

    return awards.map(item => {
      const award = item.resume_awards_id;
      return {
        title: award.title || '',
        awarder: award.organization || '',
        date: this.formatDate(award.date) || '',
        summary: award.description || '',
        url: award.link || ''
      };
    });
  }

  transformLanguages(languages) {
    if (!languages || !Array.isArray(languages)) return [];

    return languages.map(item => {
      const lang = item.resume_languages_id;
      return {
        language: lang.name || '',
        fluency: lang.level || ''
      };
    });
  }

  formatDate(dateString) {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    } catch {
      return dateString;
    }
  }

  parseLocation(locationString) {
    if (!locationString || typeof locationString !== 'string') return {};

    const parts = locationString.split(',').map(part => part.trim());
    return {
      city: parts[0] || '',
      region: parts[1] || '',
      countryCode: parts[2] || 'PA'
    };
  }
}

module.exports = DataTransformer;