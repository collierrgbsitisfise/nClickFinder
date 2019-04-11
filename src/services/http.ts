import axios from 'axios';

class HttpService {
  constructor() {}

  async getPageSource(url: string): Promise<string> {
    const response = await axios.get(url);
    return response.data;
  }
}

export default HttpService;
