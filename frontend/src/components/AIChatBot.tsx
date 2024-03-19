import { useState } from 'react';
import * as NotesApi from "../network/notes_api";
import { OpenAI } from 'openai';
import { Button } from 'react-bootstrap';
import { Note } from '../models/note';
import styles from '../styles/Chatbot.module.css';


const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

interface Message {
  role: string;
  content: string;
}

interface ChatbotProps {
    onCoversationSaved: (note: Note) => void,
}

const initialMessage = {
    role: "assistant",
    content: "Hello, I'm your intelligent diary assistant. You can chat with me about your day and I'll help you draft your diary! How do you feel today? Did you do anything fun?"
};

const sys_msg = {
    role: "system",
    content: "You will play the role of an intelligent AI journal. In our conversation, you will ask about how’s my day going. You will respond with kind comments and response and will ask follow-on questions."
  };

const summarize_msg = {
    role: "user",
    content:"Help me draft a diary based on our conversation. The writing in paragraphs rather than bullets and it should be literal. The diary should be more than 100 words. Just give the the draft. No extra words needed."
  };

let curr_msg: Message[] = [initialMessage];

const Chatbot = ({ onCoversationSaved }: ChatbotProps) => {
  const [displayMessages, setMessages] = useState<Message[]>([initialMessage]);
  const [collapsed, setCollapsed] = useState(false);
  const [userInput, setUserInput] = useState('');

  // send user message to chatbot and display response
  const handleMessageSubmit = async () => {
    // if (userInput.trim() === '') return;

    try {
      const chatHistory = curr_msg.map(({ role, content }) => ({
        role,
        content,
      }));
      console.log(chatHistory);

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [sys_msg, ...chatHistory] as OpenAI.Chat.Completions.ChatCompletionMessageParam[]
      });

      const completionText = completion.choices[0].message.content;

      const botMessage: Message = {
        role: 'assistant',
        content: completionText ? completionText : ''
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
      
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveNote = async (messageContent: string) => {
    try {
      const note = {
        title: 'Saved From Conversation',
        text: messageContent
      };
      const savedNote = await NotesApi.createNote(note);
      console.log('Note saved:', savedNote);
      onCoversationSaved(savedNote);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  return (
    <div className="container">
      {!collapsed ? (
        <div className="bg-light p-3 shadow">
          <Button size="sm" onClick={() => setCollapsed(true)} className="close-button">X</Button>
          <div className={`overflow-auto ${styles.messageBox}`}>
            {displayMessages.map((message, index) => (
              <div key={index} className="message">
                {message.role === 'user' && <strong>You:</strong>}
                {message.role === 'assistant' && <strong>Assistant:</strong>}
                <br />
                {message.content}
                <br />
                <Button variant="outline-secondary" size="sm" className={styles.saveButton} onClick={() => handleSaveNote(message.content)}>Save</Button>
              </div>
            ))}
          </div>
          <textarea
            placeholder="Type your message..."
            className="form-control mt-3 mb-3"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const userMessage: Message = {
                  role: 'user',
                  content: userInput.trim()
                };
                setMessages(prevMessages => [...prevMessages, userMessage]);
                curr_msg.push(userMessage);
                handleMessageSubmit();
                setUserInput('');
              }
            }}
          />
          <Button 
            className={styles.summarizeButton}
            onClick={() => {
            curr_msg.push(summarize_msg);
            handleMessageSubmit();
        }}
          >Summarize</Button>

          <Button 
            className={styles.clearButton} 
            onClick={() => {setMessages([initialMessage]);
                curr_msg = [initialMessage];
            } }
          >Clear</Button>
        </div>
      ) : (
        <Button onClick={() => setCollapsed(false)}>Open Chat</Button>
      )}
    </div>
  );
};

export default Chatbot;
