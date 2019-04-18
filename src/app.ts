import HttpService from './services/http';
import ParseWikiPageService from './services/parseWikiPage';
import TextAnalyzer from './services/textAnalyzer';
let currentLink = '';
let visitedLinks = <string[]>[];
let linksQueue = <{ text: string; href: string; priority: number }[]>[];

import * as fs from 'fs';

const getNextLink = (): string => {
  if (linksQueue.length === 0) {
    throw Error('link queue is empty');
  }

  let potentialNextLink = linksQueue.shift();

  if (!visitedLinks.includes(potentialNextLink.href)) {
    return potentialNextLink.href;
  }

  return getNextLink();
};

(async () => {
  // init input
  const starttLink = 'https://en.wikipedia.org/wiki/New_York_City'.toLowerCase();
  const endLink = 'https://en.wikipedia.org/wiki/Silicon_Valley'.toLowerCase();

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

  // const tokens = taOfEndLink.getTokenizedText();
  // const filteredTokens = TextAnalyzer.filterTokens(tokens);
  // const tokensWeightMap = taOfEndLink.getTokensWeightMap();
  // fs.writeFileSync('notFiltered.json', JSON.stringify(tokensWeightMap, null, '\t'));
  // fs.writeFileSync('filtered.json', JSON.stringify(filteredTokens, null, '\t'));
  while (true) {
    console.log('currentLink ', currentLink);
    const htmlOfcurrentLink = await httpService.getPageSource(currentLink);
    const wikiPageOfcurrentLink = new ParseWikiPageService(htmlOfcurrentLink);
    let linksByPriority = wikiPageOfcurrentLink.getContentLinks();
    visitedLinks.push(currentLink);

    for (let link of linksByPriority) {
      if (link.href.toLowerCase() === endLink.toLowerCase()) {
        console.log('solution was found');
        console.log(visitedLinks.length);
        fs.writeFileSync('reuslt.json', JSON.stringify(visitedLinks, null, '\t'));
        return visitedLinks;
      }

      let priority = taOfEndLink.getPharsePrioty(link.text.toLowerCase());
      link.priority = priority;
    }

    linksQueue = [...linksByPriority, ...linksQueue].sort((a, b) => b.priority - a.priority);

    // console.log('LINKS ');
    // console.log(linksQueue.splice(0, 10));
    currentLink = getNextLink();
  }
})();
