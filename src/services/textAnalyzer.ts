import * as nlp from 'natural';
import { prepositions } from './../utils/prepositions';
import { articles } from './../utils/articles';

const tokenizer = new nlp.AggressiveTokenizer();

const hashMapOfResultsForTokensSearch = new Map();
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
      const isCached = hashMapOfResultsForTokensSearch.get(word);

      if (typeof isCached === 'undefined') {
        isInTokensWord = !!(tokens.findIndex((t) => t.toLowerCase() === word.toLowerCase()) + 1);
        hashMapOfResultsForTokensSearch.set(word, isInTokensWord);
        isInTokensWord && priority++;
      } else {
        isCached && priority++;
      }
    }

    return priority;
  }

  static filterTokensByPrepositionsAndArticles(tokens: string[]) {
    const articlesAndPrepositions = [...articles, ...prepositions];
    return tokens.filter((token: string) => !articlesAndPrepositions.includes(token.toLowerCase()));
  }
}

export default TextAnalyzer;
