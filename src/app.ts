import HttpService from './services/http';
import ParseWikiPageService from './services/parseWikiPage';

(async () => {
  const startLink = 'https://en.wikipedia.org/wiki/Log-structured_merge-tree';
  const httpService = new HttpService();
  const html = await httpService.getPageSource(startLink);

  const pws = new ParseWikiPageService(html);
  console.log(pws.getContentLinks());
})();
