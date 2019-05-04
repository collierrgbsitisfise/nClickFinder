import * as cheerio from 'cheerio';
import HttpService from './http';

const httpSercice = new HttpService();

class ParseWikiPageService {
  private static baseWikiURL: string = 'https://en.wikipedia.org';
  private static internalRootPath: string = 'wiki';

  private html: string;
  private content: string;
  private $: CheerioStatic;

  static getBaseWikiUrl(): string {
    return this.baseWikiURL;
  }

  static getInternalRootPathWikiUrl(): string {
    return this.internalRootPath;
  }

  static isInternalWikiLink(href: string) {
    const isCorrectInternal = String(href).split('/')[1] === this.internalRootPath;
    return isCorrectInternal;
  }

  constructor(html: string) {
    this.html = html;
    this.$ = cheerio.load(html);
    this.content = this.$('#mw-content-text').html();
  }

  getPageContent(): string {
    return this.content;
  }

  getPageContenWithoutHtml(): string {
    return this.content.replace(/<\/?[^>]+(>|$)/g, '');
  }

  getContentLinks(): { text: string; href: string; priority: number }[] {
    const result = <{ text: string; href: string; priority: number }[]>[];

    const $ = cheerio.load(this.content);
    const links = $('a');

    $(links).each((_, link) => {
      const text = $(link).text();
      const href = $(link).attr('href');

      if (!text) {
        return;
      }

      // ignore link to images
      if (['png', 'svg', 'jpg', 'jpeg'].includes((href || '').split('.').pop())) {
        return;
      }

      ParseWikiPageService.isInternalWikiLink(href) &&
        result.push({
          text: text.toLowerCase(),
          href: `${ParseWikiPageService.baseWikiURL}${href}`,
          priority: 0,
        });
    });

    return result;
  }

  static async getAllBiDerectionalLinks(
    childLinks: string[],
    baseLink: string,
  ): Promise<{ href: string; content: string }[]> {
    const result = <{ href: string; content: string }[]>[];

    for (let childLink of childLinks) {
      let htmlContent = await httpSercice.getPageSource(childLink);
      if (ParseWikiPageService.isBiDirectionalLinkedChildPages(baseLink, htmlContent)) {
        // conntent without html;
        const cheerioHTML = cheerio.load(htmlContent);
        const content = cheerioHTML('#mw-content-text').html();

        result.push({
          href: childLink,
          content: content.replace(/<(?:.|\n)*?>/gm, ''),
        });
      }
    }

    return result;
  }

  static isBiDirectionalLinkedChildPages(wikiPageLink: string, htmlContent: string) {
    let isBidirectionalLink = false;

    const cheerioHTML = cheerio.load(htmlContent);
    const content = cheerioHTML('#mw-content-text').html();
    const $ = cheerio.load(content);
    const links = $('a');

    $(links).each((_, link) => {
      const href = $(link).attr('href');

      if (['png', 'svg', 'jpg', 'jpeg'].includes((href || '').split('.').pop())) {
        return;
      }

      if (
        ParseWikiPageService.isInternalWikiLink(href) &&
        (ParseWikiPageService.baseWikiURL + href).toLowerCase() === wikiPageLink.toLowerCase()
      ) {
        isBidirectionalLink = true;
      }
    });

    return isBidirectionalLink;
  }
}

export default ParseWikiPageService;
