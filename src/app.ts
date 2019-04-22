import HttpService from './services/http';
import ParseWikiPageService from './services/parseWikiPage';
import TextAnalyzer from './services/textAnalyzer';
let currentLink = '';
let visitedLinks = new Map();
let linksQueue = <{ text: string; href: string; priority: number }[]>[];
import * as fs from 'fs';

const getNextLink = (): string => {
  if (linksQueue.length === 0) {
    throw Error('link queue is empty');
  }

  let potentialNextLink = linksQueue.shift();

  if (!visitedLinks.get(potentialNextLink.href)) {
    console.log(potentialNextLink);
    return potentialNextLink.href;
  }

  return getNextLink();
};

(async () => {
  // init input
  const starttLink = 'https://en.wikipedia.org/wiki/Elon_Musk'.toLowerCase();
  const endLink = 'https://en.wikipedia.org/wiki/Moldova'.toLowerCase();

  currentLink = starttLink;

  // init ST service sercie class
  const httpService = new HttpService();

  // obtaing info about end page
  const htmlOfEndLink = await httpService.getPageSource(endLink);
  const wikiPageOfEndLink = new ParseWikiPageService(htmlOfEndLink);
  const contentOfEndLink = wikiPageOfEndLink.getPageContent();

  // content.replace(/<(?:.|\n)*?>/gm, '') - delete all symbols related to HTML
  const taOfEndLink = new TextAnalyzer(contentOfEndLink.replace(/<(?:.|\n)*?>/gm, ''));
  taOfEndLink.tokenizeAndStemText();
  taOfEndLink.calculateWeighgtOfTokens();

  while (true) {
    try {
      const htmlOfcurrentLink = await httpService.getPageSource(currentLink);
      const wikiPageOfcurrentLink = new ParseWikiPageService(htmlOfcurrentLink);
      let linksByPriority = wikiPageOfcurrentLink.getContentLinks();
      visitedLinks.set(currentLink, true);

      for (let link of linksByPriority) {
        if (link.href.toLowerCase() === endLink.toLowerCase()) {
          fs.writeFileSync('result.json', JSON.stringify(visitedLinks, null, '\t'));
          return visitedLinks;
        }

        let priority = taOfEndLink.getPharsePrioty(link.text.toLowerCase());
        link.priority = priority;
      }

      linksQueue = [...linksByPriority, ...linksQueue].sort((a, b) => b.priority - a.priority);

      currentLink = getNextLink();
    } catch (err) {
      visitedLinks.set(currentLink, true);
      currentLink = getNextLink();
    }
  }
})();
