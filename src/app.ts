import HttpService from './services/http';
import ParseWikiPageService from './services/parseWikiPage';
import TextAnalyzer from './services/textAnalyzer';
import * as fs from 'fs';

const getLinkPriority = (linkText: string, token: string[]) => {};

(async () => {
  const startLink = 'https://en.wikipedia.org/wiki/New_York_City'.toLowerCase();
  const endLink = 'https://en.wikipedia.org/wiki/Silicon_Valley'.toLowerCase();

  const httpService = new HttpService();

  const htmlOfStartLink = await httpService.getPageSource(startLink);
  const htmlOfEndLink = await httpService.getPageSource(endLink);

  const wikiPageOfStartLink = new ParseWikiPageService(htmlOfStartLink);
  const wikiPageOfEndLink = new ParseWikiPageService(htmlOfEndLink);

  const contentOfStartLink = wikiPageOfStartLink.getPageContent();
  const contentOfEndLink = wikiPageOfEndLink.getPageContent();

  const linksOfStartLink = wikiPageOfStartLink.getContentLinks();

  // content.replace(/<(?:.|\n)*?>/gm, '') - delete all symbols related to HTML
  const taOfEndLink = new TextAnalyzer(contentOfEndLink.replace(/<(?:.|\n)*?>/gm, ''));
  taOfEndLink.tokenizeAndStemText();
  const endLinkTokens = taOfEndLink.getTokenizedText();

  // console.log(endLinkTokens);
  for (let link of linksOfStartLink) {
    let priority = TextAnalyzer.getPharsePriotyByTokens(link.text, endLinkTokens);
    link.priority = priority;
    // console.log(`${link.text} : ${priority}`);
  }
  fs.writeFileSync('logs.json', JSON.stringify(linksOfStartLink.sort((a, b) => b.priority - a.priority), null, '\t'));
})();
