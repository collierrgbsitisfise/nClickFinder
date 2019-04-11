import { HttpService } from './services';

(async () => {
  const startLink = 'https://en.wikipedia.org/wiki/Chi%C8%99in%C4%83u';
  const httpService = new HttpService();
  const html = await httpService.getPageSource(startLink);
  console.log(html);
})();
