import * as cheerio from 'cheerio';

class ParseWikiPageService {
  private html: string;
  private content: string;
  private $: CheerioStatic;

  constructor(html: string) {
    this.html = html;
    this.$ = cheerio.load(html);
    this.content = this.$('#content').html();
  }

  getPageContent(): string {
    return this.content;
  }

  getBodyLinks(): { name: string; href: string }[] {
    const result = <{ name: string; href: string }[]>[];

    const $ = cheerio.load(this.content);
    const links = $('a');

    $(links).each((_, link) => {
      result.push({
        name: $(link).text(),
        href: $(link).attr('href'),
      });
    });

    return result;
  }
}

export default ParseWikiPageService;
