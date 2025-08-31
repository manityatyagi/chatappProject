import { Message } from "../models/message.model.js";
import { Chat } from "../models/chat.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { v2 as cloudinary } from "cloudinary";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: "gemini-1.5-pro",
      temperature: 0.7,
      maxOutputTokens: 2048,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const BOT_ID = process.env.BOT_USER_ID || '66c5a3f123456789abcdef01';

const conversationMemories = new Map();

const systemPrompt = ChatPromptTemplate.fromMessages([
    ["system", `You are a helpful AI assistant integrated in a chat application. Your name is ChatBot.
         Be friendly, concise, and helpful. Keep responses relatively short like a messaging app.
         You can help with general knowledge, answer questions, and provide suggestions.
         If you don't know something, say so politely. `],
         new HumanMessage("history"),
         ["human", "{input}"],
]);

const handleBotMessage = async(socket, messageData) => {
      try {
          const {content, chatId, userId} = messageData;

          const chat = await Chat.findOne({
            _id: chatId,
            users: {
                $all: [userId, BOT_ID]
            }
          });
          if(!chat) {
            console.error('Invalid bot chat');
            socket.emit('message received', {
              sender: BOT_ID,
              content: "Sorry, I couldn't find your chat session. Please start a new chat."
            });
            return;
          }

          let memory = conversationMemories.get(userId.toString());
          if(!memory) {
            memory = new BufferMemory({
                returnMessages: true,
                memoryKey: 'history'
            });
            conversationMemories.set(userId.toString(), memory);
          }

          const chain = new ConversationChain({
            llm: model,
            memory: memory,
            prompt: systemPrompt
          });

          const response = await chain.call({
            input: content
          });

          const newMessage = await Message.create({
            sender: BOT_ID,
            content: response.response
          });

          let populatedMessage = await Message.populate(newMessage, {
            path: 'sender', 
            select: 'name email'
          });

          populatedMessage = await Chat.populate(populatedMessage, {
                path: 'chat'
          });

          await Chat.findByIdAndUpdate(chatId, {latestMessage: populatedMessage});
          
          socket.emit('message received', populatedMessage);
      } catch (error) {
        console.error("Bot message error", error.message);
      
     const errorMessage = await Message.create({
            sender: BOT_ID,
            content: "Sorry, I'm having trouble processing your request.Please try again later.",
        });

        socket.emit('message received', errorMessage);
    }
};

const handleCommands = async(userId, command) => {
        try {
             switch((command || '').toLowerCase()) {
                 case '/help': 
                     return "Available commands:\n/help - Show this help message\n/weather - Get weather information\n/news - Get latest news\n/joke - Tell a joke"
             
                 case '/weather': 
                   return "I can fetch weather info. Please tell me your location or enable location sharing.";
                 
                 case '/news':
                    return "Here are the latest headlines: [News API integration would go here]";

                 case '/joke': 
                    return "Why don't scientists trust atoms? Because they make up everything!";
                
            default: 
              return "Unknown command. Type /help for available commands.";
                }
    } catch (error) {
      console.error("Command error:", error);
      return "Sorry, there was an error processing your command.";
        }
};

const clearAIChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [userId, BOT_ID] }
    });
    if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
    }
    await Message.deleteMany({ chat: chat._id });
    conversationMemories.delete(userId.toString());

    res.json({ message: "Conversation history cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getConversationHistory = async(userId, chatId) => {
    try {
     const messages = await Message.find({ chat: chatId })
           .sort({ createdAt: 1 })
           .limit(20);
     return messages.map(msg => ({
           sender: msg.sender.toString() === BOT_ID ? 'AI' : 'User',
           content: msg.content,
           timestamp: msg.createdAt
       }));
  } catch (error) {
    console.error("Error getting conversation history", error);
    return [];
  }
};

const ensureUserMemory = (userId) => {
  let memory = conversationMemories.get(userId);
  if (!memory) {
    memory = new BufferMemory({ returnMessages: true, memoryKey: "history" });
    conversationMemories.set(userId, memory);
  }
  return memory;
};

const chatWithAI = async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    const { message, documents = [], customPrompt } = req.body || {};
    if (!message) return res.status(400).json({ error: "message is required" });

    const memory = ensureUserMemory(userId || 'anonymous');
    const responsePrompt = customPrompt || `You are an advanced AI assistant designed to interact with users in a natural, human-like way. 
Your core abilities include:
- Conversational responses that feel empathetic, clear, and helpful.
- Answering questions across knowledge, reasoning, problem-solving, and creativity.
- Generating different types of outputs depending on the request:
   • Text (explanations, summaries, step-by-step guides, creative writing).
   • Images (via text-to-image prompts).
   • Code (well-structured, production-ready snippets or full applications).
   • Data (charts, tables, or JSON when requested).
- Supporting tool usage when needed (e.g., APIs, external services, integrations).
- Adapting tone to context: professional, casual, technical, or creative as requested.
- Always clarifying ambiguity with follow-up questions before assuming.

Goals:
- Be engaging and conversational while remaining accurate and useful.
- Provide multiple options or perspectives when creativity is needed.
- When asked for images, respond with clear prompts that a text-to-image model can generate.
- When asked for code, provide tested, modular, and documented examples.
- Be proactive in suggesting possible enhancements (e.g., "Would you also like me to generate a visual summary?").
- Always prioritize safety, truthfulness, and clarity.
`
    let usedMode = 'generative';
    let sources = [];
    let promptToUse = systemPrompt;
    let callInput = { input: message };

    try {
      if (Array.isArray(documents) && documents.length > 0) {
        const texts = documents.map((d) => d.text).filter(Boolean);
        if (texts.length > 0) {
          const metadatas = documents.map((d) => d.metadata || {});
          const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey: process.env.GOOGLE_API_KEY });
          const vectorStore = await MemoryVectorStore.fromTexts(texts, metadatas, embeddings);
          const results = await vectorStore.similaritySearch(message, 4);

          if (results && results.length > 0) {
            const contextText = results
              .map((r, idx) => `Source ${idx + 1}: ${r.pageContent}`)
              .join("\n\n");
            sources = results.map((r) => r.metadata || {});

            const ragPrompt = ChatPromptTemplate.fromMessages([
              [
                 "system",
                  responsePrompt,
              ],
              ["human", `Context:\n{context}\n\nQuestion: {question}`],
            ]);

            promptToUse = ragPrompt;
            callInput = { context: contextText, question: message };
            usedMode = 'rag';
          }
       }
      }
    } catch (retrievalErr) {
      usedMode = 'generative';
      sources = [];
      promptToUse = systemPrompt;
      callInput = { input: message };
    }

    const chain = new ConversationChain({ llm: model, memory, prompt: promptToUse });
    const response = await chain.call(callInput);

    return res.json({ message: response.response, mode: usedMode, sources });
  } catch (err) {
    console.error("chatWithAI error:", err);
    return res.status(500).json({ error: "Failed to get AI response" });
  }
};

const chatWithRAG = async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    const { message, documents = [] } = req.body || {};
    if (!message) return res.status(400).json({ error: "message is required" });

    const texts = documents.map((d) => d.text).filter(Boolean);
    const metadatas = documents.map((d) => d.metadata || {});

    const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey: process.env.GOOGLE_API_KEY });    const vectorStore = await MemoryVectorStore.fromTexts(texts, metadatas, embeddings);

    const results = await vectorStore.similaritySearch(message, 4);
    const contextText = results
      .map((r, idx) => `Source ${idx + 1}: ${r.pageContent}`)
      .join("\n\n");

    const ragPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a helpful assistant. Answer using the provided context when relevant. If the context is not sufficient, reply with your best general knowledge but indicate uncertainty. Keep answers concise."
      ],
      ["human", `Context:\n{context}\n\nQuestion: {question}`],
    ]);

    const memory = ensureUserMemory(userId || 'anonymous');
    const chain = new ConversationChain({ llm: model, memory, prompt: ragPrompt });
    const response = await chain.call({ context: contextText, question: message });

    return res.json({ message: response.response, sources: results.map((r) => r.metadata || {}) });
  } catch (err) {
    console.error("chatWithRAG error:", err);
    return res.status(500).json({ error: "Failed to get RAG response" });
  }
};

const handleCommandsHttp = async (req, res) => {
  try {
    const { command } = req.body || {};
    const userId = req.user?.id?.toString();
    const reply = await handleCommands(userId, command || '');
    return res.json({ message: reply });
  } catch (err) {
    console.error("handleCommandsHttp error:", err);
    return res.status(500).json({ error: "Failed to process command" });
  }
};

const generateImage = async (req, res) => {
  try {
    const { prompt, userId } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    
    const enhancedPromptModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const enhanceResult = await enhancedPromptModel.generateContent([
      `Enhance this image generation prompt to be more detailed and artistic: "${prompt}". 
       Return only the enhanced prompt, nothing else.`
    ]);
    
    const enhancedPrompt = enhanceResult.response.text();

    const imageResponse = {
      success: true,
      imageUrl: `https://via.placeholder.com/512x512/4F46E5/FFFFFF?text=${encodeURIComponent(prompt.substring(0, 20))}`,
      enhancedPrompt,
      originalPrompt: prompt
    };

    const aiRecord = new (await import("../models/AI.model.js")).AI({
      user: userId,
      prompt: `Image generation: ${prompt}`,
      response: `Generated image with enhanced prompt: ${enhancedPrompt}`,
      model: 'gemini-1.5-pro-vision'
    });
    await aiRecord.save();

    res.json(imageResponse);
  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: "Failed to generate image" });
  }
};

const processDocument = async (req, res) => {
  try {
    const { text, metadata = {} } = req.body;
    if (!text) return res.status(400).json({ error: "Text content is required" });

    const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey: process.env.GOOGLE_API_KEY });
    
    
    const chunks = text.match(/.{1,1000}/g) || [text];
    const processedChunks = chunks.map((chunk, index) => ({
      text: chunk,
      metadata: { ...metadata, chunkIndex: index, totalChunks: chunks.length }
    }));

    res.json({ 
      success: true, 
      chunks: processedChunks,
      message: `Document processed into ${chunks.length} chunks`
    });
  } catch (error) {
    console.error("Document processing error:", error);
    res.status(500).json({ error: "Failed to process document" });
  }
};


const chatWithContext = async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    const { message, context = [], imageAnalysis = false } = req.body;
    
    if (!message) return res.status(400).json({ error: "Message is required" });

    const memory = ensureUserMemory(userId || 'anonymous');
    let responseText = "";

    if (imageAnalysis && context.length > 0) {
      const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro-vision" });
      
      const parts = [
        { text: message },
        ...context.filter(item => item.type === 'image').map(item => ({
          inlineData: {
            mimeType: item.mimeType || "image/jpeg",
            data: item.data
          }
        }))
      ];

      const result = await visionModel.generateContent(parts);
      responseText = result.response.text();
    } else {
      const chain = new ConversationChain({ 
        llm: model, 
        memory,
        prompt: systemPrompt 
      });
      
      const response = await chain.call({ input: message });
      responseText = response.response;
    }

    const aiRecord = new (await import("../models/AI.model.js")).AI({
      user: userId,
      prompt: message,
      response: responseText,
      model: imageAnalysis ? 'gemini-1.5-pro-vision' : 'gemini-1.5-pro'
    });
    await aiRecord.save();

    res.json({ 
      message: responseText,
      hasImageAnalysis: imageAnalysis,
      contextUsed: context.length > 0
    });
  } catch (error) {
    console.error("Context chat error:", error);
    res.status(500).json({ error: "Failed to process chat with context" });
  }
};

export { 
  chatWithAI, 
  chatWithRAG, 
  handleCommandsHttp, 
  handleBotMessage, 
  getConversationHistory, 
  clearAIChatHistory,
  generateImage,
  processDocument,
  chatWithContext
};