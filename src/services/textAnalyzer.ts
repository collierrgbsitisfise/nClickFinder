import * as nlp from 'natural';
const tokenizer = new nlp.WordTokenizer();

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

  tokenizeText(): void {
    this.tokenizedText = tokenizer.tokenize(this.text);
  }
}

export default TextAnalyzer;
