import yaml from 'js-yaml';

/**
 * Generates a markdown file with YAML frontmatter containing the store state
 * and a human-readable body for Markdown Sync.
 */
export function exportToMarkdown(state: any) {
  const frontmatter = {
    vocabulary: state.vocabulary,
    sessionLog: state.sessionLog,
    profile: state.profile,
    compositionLog: state.compositionLog,
    savedPhrases: state.savedPhrases,
    lastExported: new Date().toISOString()
  };

  const yamlBlock = `---\n${yaml.dump(frontmatter)}---\n\n`;

  let body = `# Composition Archive\n\n`;
  if (state.compositionLog && state.compositionLog.length > 0) {
    state.compositionLog.forEach((c: any) => {
      body += `## ${new Date(c.date).toLocaleDateString()}\n${c.text}\n\n`;
      if (c.translation) body += `*Translation: ${c.translation}*\n\n`;
    });
  } else {
    body += `*No archived compositions yet.*\n\n`;
  }

  body += `# Saved Phrases\n\n`;
  if (state.savedPhrases && state.savedPhrases.length > 0) {
    state.savedPhrases.forEach((p: any) => {
      const tp = typeof p === 'string' ? p : p.tp;
      const en = typeof p === 'string' ? '' : (p.en || '');
      body += `- **${tp}**${en ? `: ${en}` : ''}\n`;
    });
  } else {
    body += `*No saved phrases yet.*\n`;
  }

  const fullContent = yamlBlock + body;
  const blob = new Blob([fullContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Toki_Pona_Mastery.md';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses a markdown file and extracts the YAML frontmatter for store hydration.
 */
export function importFromMarkdown(content: string): any {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error('No valid YAML frontmatter found. Ensure the file starts with --- and contains a valid YAML block.');
  
  const yamlContent = match[1];
  const data = yaml.load(yamlContent);
  if (!data || typeof data !== 'object') throw new Error('Invalid data format in YAML block.');
  
  return data;
}
