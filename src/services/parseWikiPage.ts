import * as cheerio from 'cheerio';

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

      // ignore link without text
      if (!text) {
        return;
      }

      // ignore link to images
      if (['png', 'svg', 'jpg', 'jpeg'].includes((href || '').split('.').pop())) {
        return;
      }

      ParseWikiPageService.isInternalWikiLink(href) &&
        result.push({
          text,
          href: `${ParseWikiPageService.baseWikiURL}${href}`,
          priority: 0,
        });
    });

    return result;
  }
}

export default ParseWikiPageService;
