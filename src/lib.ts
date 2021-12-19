import axios from "axios";
import TurndownService from "turndown";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export type Article = {
  url: string;
  content: string;
  title: string;
  author: string;
};

export function initTurndownService(): TurndownService {
  const turndownService = new TurndownService({
    codeBlockStyle: "fenced",
  }).addRule("code_block", {
    filter: function(node) {
      return node.nodeName == "PRE";
    },
    replacement: function(content, node) {
      const code = turndownService.escape(node.textContent || content);
      const fence = "```";

      return `

${fence}
    ${code.replace(/\n/g, "\n    ")}
${fence}

`;
    },
  });

  return turndownService;
}

export async function parse(
  url: string,
  turndownService: TurndownService
): Promise<Article> {
  const response = await axios.get(url);
  const doc = new JSDOM(response.data);
  const reader = new Readability(doc.window.document);
  const article = reader.parse();

  if (article === null) {
    throw new Error(`failed to parse article from the url: ${url}`);
  }

  const content = turndownService.turndown(article.content);
  return {
    content,
    url,
    title: article.title,
    author: article.byline,
  };
}
