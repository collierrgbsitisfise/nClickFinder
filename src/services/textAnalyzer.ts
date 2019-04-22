import * as nlp from 'natural';
import { prepositions } from './../utils/prepositions';
import { articles } from './../utils/articles';
import { conjunctions } from './../utils/conjunctions';

const tokenizer = new nlp.AggressiveTokenizer();

const hashMapOfResultsForTokensSearch = new Map();
class TextAnalyzer {
  private text: string;
  private tokenizedText: string[];
  private tokensWeightMap: { [index: string]: number };

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

  getTokensWeightMap() {
    if (!this.tokensWeightMap) {
      throw Error('Token weight map was not created yet, user "calculateWeighgtOfTokens" method');
    }

    return this.tokensWeightMap;
  }

  tokenizeAndStemText(): void {
    this.tokenizedText = tokenizer.tokenize(this.text).map((token) => nlp.PorterStemmer.stem(token.toLowerCase()));
  }

  getPharsePrioty(phrase: string) {
    const stemedPharse = phrase.split(' ').map((p) => nlp.PorterStemmer.stem(p.toLowerCase()));
    let priority = 0;
    let updatePriority = (key: string) => {
      priority += this.tokensWeightMap[key] || 0;
    };

    for (let word of stemedPharse) {
      updatePriority(word);
    }

    return priority;
  }

  calculateWeighgtOfTokens() {
    this.tokensWeightMap = this.tokenizedText.reduce(
      (acc: { [index: string]: number }, curr: string) => ({
        ...acc,
        [curr]: acc[curr] ? ++acc[curr] : 1,
      }),
      {},
    );
  }

  static filterTokens(tokens: string[]) {
    const articlesPrepositionsAndConjunctions = [...articles, ...prepositions, ...conjunctions];
    return tokens.filter((token: string) => !articlesPrepositionsAndConjunctions.includes(token.toLowerCase()));
  }
}

export default TextAnalyzer;
