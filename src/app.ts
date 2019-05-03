import HttpService from './services/http';
import ParseWikiPageService from './services/parseWikiPage';
import TextAnalyzer from './services/textAnalyzer';
let currentLink = '';
let visitedLinks = new Map();
let linksQueue = <{ text: string; href: string; priority: number }[]>[];

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
  const starttLink = 'https://en.wikipedia.org/wiki/New_York_City'.toLowerCase();
  const endLink = 'https://en.wikipedia.org/wiki/Silicon_Valley'.toLowerCase();
  currentLink = starttLink;

  // init ST service class
  const httpService = new HttpService();

  // obtaing info about end page
  const htmlOfEndLink = await httpService.getPageSource(endLink);
  const wikiPageOfEndLink = new ParseWikiPageService(htmlOfEndLink);
  const contentOfEndLink = wikiPageOfEndLink.getPageContent();
  const linkOfEndPage = wikiPageOfEndLink.getContentLinks();

  // content.replace(/<(?:.|\n)*?>/gm, '') - delete all symbols related to HTML
  const tagOfEndLink = new TextAnalyzer(contentOfEndLink.replace(/<(?:.|\n)*?>/gm, ''));
  tagOfEndLink.tokenizeAndStemText();
  tagOfEndLink.calculateWeighgtOfTokens();

  for (let link of linkOfEndPage) {
    let priority = tagOfEndLink.getPharsePrioty(link.text.toLowerCase());
    link.priority = priority;
  }
  const top10LinksOfEndLink = linkOfEndPage.sort((a, b) => b.priority - a.priority).slice(0, 10);
  const hrefsOnlyOfTop10EndPageLinks = top10LinksOfEndLink.map(({ href }) => href);

  console.log('hrefsOnlyOfTop10EndPageLinks');
  console.log(hrefsOnlyOfTop10EndPageLinks);
  const biDirectionalLinksOfEndPage = await ParseWikiPageService.getAllBiDerectionalLinks(
    hrefsOnlyOfTop10EndPageLinks,
    'https://en.wikipedia.org/wiki/Silicon_Valley',
  );

  console.log('linkOfEndPage');
  console.log(biDirectionalLinksOfEndPage);
  // while (true) {
  //   try {
  //     const htmlOfcurrentLink = await httpService.getPageSource(currentLink);
  //     const wikiPageOfcurrentLink = new ParseWikiPageService(htmlOfcurrentLink);
  //     let linksByPriority = wikiPageOfcurrentLink.getContentLinks();
  //     visitedLinks.set(currentLink, true);

  //     for (let link of linksByPriority) {
  //       if (link.href.toLowerCase() === endLink.toLowerCase()) {
  //         console.log('TOTAL links visited : ', visitedLinks.size);
  //         return visitedLinks;
  //       }

  //       let priority = tagOfEndLink.getPharsePrioty(link.text.toLowerCase());
  //       link.priority = priority;
  //     }

  //     linksQueue = [...linksByPriority, ...linksQueue].sort((a, b) => b.priority - a.priority);

  //     currentLink = getNextLink();
  //   } catch (err) {
  //     visitedLinks.set(currentLink, true);
  //     currentLink = getNextLink();
  //   }
  // }
})();
