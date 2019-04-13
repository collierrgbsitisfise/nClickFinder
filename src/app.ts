import HttpService from './services/http';
import ParseWikiPageService from './services/parseWikiPage';
import TextAnalyzer from './services/textAnalyzer';

(async () => {
  const startLink = 'https://en.wikipedia.org/wiki/Log-structured_merge-tree';
  const httpService = new HttpService();
  const html = await httpService.getPageSource(startLink);

  const pws = new ParseWikiPageService(html);
  const content = pws.getPageContent();
  const contentLinks = pws.getContentLinks();

  // content.replace(/<(?:.|\n)*?>/gm, '') - delete all symbols related to HTML
  const ta = new TextAnalyzer(content.replace(/<(?:.|\n)*?>/gm, ''));
  ta.tokenizeText();
  console.log(ta.getTokenizedText());
})();
