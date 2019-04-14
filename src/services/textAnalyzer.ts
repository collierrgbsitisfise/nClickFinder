import * as nlp from 'natural';
const tokenizer = new nlp.AggressiveTokenizer();

class TextAnalyzer {
  private text: string;
  private tokenizedText: string[];

  constructor(text: string) {
    this.text = text;
  }

  getText(): any {
    return this.text;
  }

  getTokenizedText(): string[] {
    if (!Array.isArray(this.tokenizedText)) {
      throw Error('Text was not tokenized yet, use "tokenizeText" method');
    }

    return this.tokenizedText;
  }

  tokenizeAndStemText(): void {
    this.tokenizedText = tokenizer.tokenize(this.text).map(nlp.PorterStemmer.stem);
  }

  static getPharsePriotyByTokens(phrase: string, tokens: string[]) {
    const stemedPharse = phrase.split(' ').map(nlp.PorterStemmer.stem);
    let isInTokensWord = false;
    let priority = 0;
    for (let word of stemedPharse) {
      isInTokensWord = !!(tokens.findIndex((t) => t.toLowerCase() === word.toLocaleLowerCase()) + 1);
      isInTokensWord && priority++;
    }

    return priority;
  }
}

export default TextAnalyzer;
