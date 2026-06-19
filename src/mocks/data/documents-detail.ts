import { faker } from '@faker-js/faker'

const contentCache = new Map<number, string>()

export function getDocumentContent(id: number): string {
  if (contentCache.has(id)) return contentCache.get(id)!

  faker.seed(id * 500)

  const md = [
    `## ${faker.lorem.words(4)}\n`,
    faker.lorem.paragraph(3),
    `\n\n## Introduction\n`,
    faker.lorem.paragraph(4),
    `\n\n## Details\n`,
    `- ${faker.lorem.sentence()}`,
    `- ${faker.lorem.sentence()}`,
    `- ${faker.lorem.sentence()}`,
    `- ${faker.lorem.sentence()}`,
    `\n\n### Implementation Notes\n`,
    faker.lorem.paragraph(2),
    `\n\n\`\`\`typescript\nexport interface Config {\n  apiUrl: string\n  timeout: number\n  retries: number\n}\n\nconst defaultConfig: Config = {\n  apiUrl: 'https://api.example.com',\n  timeout: 5000,\n  retries: 3,\n}\n\`\`\`\n`,
    `\n\n## Guidelines\n`,
    faker.lorem.paragraph(3),
    `\n\n> ${faker.lorem.sentence()}\n`,
    `\n\n## References\n`,
    `- [Documentation](https://example.com/docs)`,
    `- [API Reference](https://example.com/api)`,
    `- [Best Practices](https://example.com/guide)`,
  ].join('\n')

  contentCache.set(id, md)
  return md
}
