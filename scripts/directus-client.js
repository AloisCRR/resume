class DirectusClient {
  constructor(baseUrl, authToken) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
    this.headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      this.headers['Authorization'] = `Bearer ${this.authToken}`;
    }
  }

  async queryGraphQL(query, variables = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/graphql`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      return result.data;
    } catch (error) {
      console.error('Error querying GraphQL:', error);
      throw error;
    }
  }

  async getAvailableLanguages() {
    const query = `
      query GetAvailableLanguages {
        resumes {
          lang
        }
      }
    `;
    
    const data = await this.queryGraphQL(query);
    const languages = [...new Set(data.resumes.map(resume => resume.lang))];
    return languages;
  }

  async getResumeData(language) {
    const query = `
      query GetResume($lang: String!) {
        resumes(filter: { lang: { _eq: $lang } }) {
        id
        name
        title
        lang
        summary
        keywords
        location
          profile_image
          links {
            id
            name
            icon
            link
          }
          work_experience {
            resume_work_experience_id {
              id
              company
              title
              location
              start_date
              end_date
              website
              tech_used {
                skills_id {
                  id
                  name
                }
              }
              responsibilities {
                id
                description
              }
            }
          }
          projects(sort: ["-resume_projects_id.date"]) {
            resume_projects_id {
              id
              title
              date
              website
              image
              features {
                id
                resume_project_features_id {
                  description
                }
              }
            }
          }
          skills {
            resume_skills_id {
              id
              category
              skills {
                name
              }
            }
          }
          education {
            resume_education_id {
              id
              degree
              institution
              location
              start_date
              end_date
              score
              focus
            }
          }
          certificates {
            resume_certificates_id {
              id
              title
              organization
              date
              link
            }
          }
          awards {
            resume_awards_id {
              id
              title
              organization
              description
              link
              date
            }
          }
          languages {
            resume_languages_id {
              id
              name
              level
            }
          }
        }
      }
    `;
    
    const data = await this.queryGraphQL(query, { lang: language });
    
    if (!data.resumes || data.resumes.length === 0) {
      throw new Error(`No resume found for language: ${language}`);
    }
    
    return data.resumes[0];
  }
}

module.exports = DirectusClient;