import axios from "axios";
import TurndownService from "turndown";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

type Article = {
    url: String,
    content: string,
    title: string,
    author: string,
    date_published: string,
    word_count: number,
}

export default async function parse(url: string, turndownService: TurndownService): Promise<Article> {
    const response = await axios.get(url);
    const doc = new JSDOM(response.data);
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    const content = turndownService.turndown(article.content);
    return {
        content, url, title: article.title, author: "", date_published: "", word_count: 0
    };
}