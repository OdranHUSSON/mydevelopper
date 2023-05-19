const { Configuration, OpenAIApi } = require('openai');

class OpenAIService {
  constructor(apiKey) {
    this.api = new OpenAIApi(new Configuration({ apiKey }));
  }

  async generateCompletions(prompt, maxTokens = 1000, n = 1) {
    const completion = await this.api.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: maxTokens,
      n,
    });

    return completion.data.choices.map(choice => choice.text);
  }
}

module.exports = OpenAIService;
