// Data structure for message queue with priority (DSA implementation)
class PriorityQueue {
    constructor() {
        this.items = [];
    }
    
    // Add element to the queue with priority
    enqueue(element, priority) {
        const queueElement = { element, priority };
        let added = false;
        
        for (let i = 0; i < this.items.length; i++) {
            if (priority < this.items[i].priority) {
                this.items.splice(i, 0, queueElement);
                added = true;
                break;
            }
        }
        
        if (!added) {
            this.items.push(queueElement);
        }
    }
    
    // Remove element from the queue
    dequeue() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items.shift().element;
    }
    
    // Check if queue is empty
    isEmpty() {
        return this.items.length === 0;
    }
}

// Stack implementation for tracking conversation history (DSA implementation)
class Stack {
    constructor(maxSize = 50) {
        this.items = [];
        this.maxSize = maxSize;
    }
    
    push(element) {
        if (this.items.length >= this.maxSize) {
            this.items.shift(); // Remove oldest item if at capacity
        }
        this.items.push(element);
    }
    
    pop() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items.pop();
    }
    
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items[this.items.length - 1];
    }
    
    isEmpty() {
        return this.items.length === 0;
    }
    
    size() {
        return this.items.length;
    }
    
    getItems() {
        return [...this.items]; // Return a copy of the items
    }
}

// Main application code
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');
    const themeSwitch = document.getElementById('theme-switch');
    const loadingSpinner = document.getElementById('loading-spinner');
    const topicButtons = document.querySelectorAll('.topic-btn');
    
    // Initialize data structures
    const messageQueue = new PriorityQueue();
    const conversationHistory = new Stack();
    
    // Sample questions for each topic
    const sampleQuestions = {
        'data-structures': [
            "Explain the difference between an array and a linked list.",
            "What is a hash table and how does it work?",
            "Explain how a binary search tree works."
        ],
        'algorithms': [
            "Describe the quicksort algorithm and its time complexity.",
            "What is dynamic programming and when would you use it?",
            "Explain the difference between BFS and DFS traversal."
        ],
        'system-design': [
            "How would you design a URL shortening service like bit.ly?",
            "Explain how you would design a social media feed.",
            "Design a distributed cache system."
        ],
        'javascript': [
            "What is the difference between let, const, and var in JavaScript?",
            "Explain closures in JavaScript with an example.",
            "How does prototypal inheritance work in JavaScript?"
        ],
        'python': [
            "What are Python generators and how do they work?",
            "Explain list comprehensions in Python with examples.",
            "What are decorators in Python and how do you use them?"
        ]
    };
    
    // List of non-technical questions to filter out
    const nonTechnicalQuestions = [
        'who are you', 'what are you', 'how are you', 'your name', 'tell me about yourself',
        'where are you from', 'what can you do', 'help me with', 'can you help',
        'weather', 'news', 'politics', 'sports', 'music', 'movies', 'tell me a joke',
        'tell me a story', 'what is the meaning of life', 'are you human', 'are you ai'
    ];
    
    // Theme toggle functionality
    themeSwitch.addEventListener('change', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('darkMode', themeSwitch.checked);
    });
    
    // Check for saved theme preference
    if (localStorage.getItem('darkMode') === 'true') {
        themeSwitch.checked = true;
        document.body.classList.add('dark');
    }
    
    // Send message when button is clicked
    sendButton.addEventListener('click', () => {
        sendMessage();
    });
    
    // Send message when Enter key is pressed (without Shift)
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Topic button click handlers
    topicButtons.forEach(button => {
        button.addEventListener('click', () => {
            const topic = button.getAttribute('data-topic');
            const questions = sampleQuestions[topic];
            if (questions && questions.length > 0) {
                // Get a random question from the topic
                const randomIndex = Math.floor(Math.random() * questions.length);
                const randomQuestion = questions[randomIndex];
                
                // Add bot message with the question
                addBotMessage(`Here's a ${topic} question: ${randomQuestion}`);
                
                // Add follow-up hint after a delay
                setTimeout(() => {
                    addBotMessage("Need a hint? Just ask for one!");
                }, 2000);
            }
        });
    });
    
    // Function to check if a message is a non-technical question
    function isNonTechnicalQuestion(message) {
        const lowerMessage = message.toLowerCase();
        return nonTechnicalQuestions.some(phrase => lowerMessage.includes(phrase));
    }
    
    // Add this to your existing nonTechnicalQuestions array
    const codeRequestPatterns = [
        'write code', 'code in', 'write a program', 'implement', 'code for',
        'function to', 'create a', 'program in', 'write the code', 'code to'
    ];
    
    // Add this function to detect code requests
    function isCodeRequest(message) {
        const lowerMessage = message.toLowerCase();
        return codeRequestPatterns.some(pattern => lowerMessage.includes(pattern));
    }
    
    // Modify the sendMessage function
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        // Add user message to chat
        addUserMessage(message);
        userInput.value = '';
        
        // Check if the message is a non-technical question
        if (isNonTechnicalQuestion(message)) {
            addBotMessage("I'm an AI Interview Practice Assistant focused on technical topics. Please ask me about programming, data structures, algorithms, system design, or specific programming languages to help you prepare for technical interviews.");
            return;
        }
        
        // Check if it's a code request and handle it directly
        if (isCodeRequest(message)) {
            handleCodeRequest(message);
            return;
        }
        
        // Add to conversation history
        conversationHistory.push({ role: 'user', content: message });
        
        // Show loading spinner
        loadingSpinner.style.display = 'flex';
        
        // Send the message to the server
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                history: conversationHistory.getItems()
            }),
        })
        .then(response => response.json())
        .then(data => {
            // Hide loading spinner
            loadingSpinner.style.display = 'none';
            
            // Add bot message with the response
            if (data.response) {
                // Process the response to ensure it's not too long
                const processedResponse = processResponse(data.response);
                addBotMessageWithTypingEffect(processedResponse);
                
                // Add to conversation history
                conversationHistory.push({ role: 'assistant', content: processedResponse });
            } else if (data.error) {
                addBotMessage("Sorry, I encountered an error. Please try again.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loadingSpinner.style.display = 'none';
            addBotMessage("Sorry, I couldn't connect to the server. Please try again later.");
        });
    }
    
    // Function to process and limit response length
    function processResponse(response) {
        // Split response into paragraphs
        const paragraphs = response.split('\n\n').filter(p => p.trim() !== '');
        
        // If response is already concise, return it as is
        if (paragraphs.length <= 4) return response;
        
        // Otherwise, limit to first 4 paragraphs
        return paragraphs.slice(0, 4).join('\n\n');
    }
    
    // Add user message to chat
    function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('max-w-[80%]', 'p-3', 'rounded-lg', 'mb-3', 'self-end', 'bg-blue-100', 'dark:bg-blue-900', 'rounded-br-none', 'shadow-md', 'transform', 'transition-all', 'duration-300', 'hover:scale-[1.02]', 'z-10');
        messageElement.textContent = message;
        chatContainer.appendChild(messageElement);
        scrollToBottom();
    }
    
    // Add bot message to chat with typing effect
    function addBotMessageWithTypingEffect(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('max-w-[80%]', 'p-3', 'rounded-lg', 'mb-3', 'self-start', 'bg-gray-100', 'dark:bg-gray-700', 'rounded-bl-none', 'shadow-md', 'transform', 'transition-all', 'duration-300', 'hover:scale-[1.02]', 'z-10');
        
        // Create a container for the typing effect
        const typingContainer = document.createElement('div');
        messageElement.appendChild(typingContainer);
        chatContainer.appendChild(messageElement);
        scrollToBottom();
        
        // Process markdown-like syntax for code blocks
        if (message.includes('```')) {
            const parts = message.split('```');
            let currentIndex = 0;
            
            const typeNextPart = () => {
                if (currentIndex < parts.length) {
                    if (currentIndex % 2 === 0) {
                        // Regular text - type it out
                        typeText(parts[currentIndex].replace(/\n/g, '<br>'), typingContainer, () => {
                            currentIndex++;
                            typeNextPart();
                        });
                    } else {
                        // Code block - add it immediately
                        const codeBlock = document.createElement('pre');
                        codeBlock.classList.add('bg-gray-200', 'dark:bg-gray-800', 'p-3', 'rounded', 'my-2', 'overflow-x-auto');
                        const code = document.createElement('code');
                        code.textContent = parts[currentIndex];
                        codeBlock.appendChild(code);
                        typingContainer.appendChild(codeBlock);
                        currentIndex++;
                        setTimeout(typeNextPart, 300);
                    }
                }
            };
            
            typeNextPart();
        } else {
            // Regular text with line breaks
            typeText(message.replace(/\n/g, '<br>'), typingContainer);
        }
    }
    
    // Function to create typing effect
    function typeText(text, element, callback) {
        let html = '';
        let index = 0;
        const speed = 20; // typing speed in milliseconds
        
        function type() {
            if (index < text.length) {
                // Handle HTML tags (like <br>)
                if (text.substring(index, index + 4) === '<br>') {
                    html += '<br>';
                    index += 4;
                } else {
                    html += text.charAt(index);
                    index++;
                }
                
                element.innerHTML = html;
                scrollToBottom();
                setTimeout(type, speed);
            } else if (callback) {
                callback();
            }
        }
        
        type();
    }
    
    // Add bot message to chat (without typing effect)
    function addBotMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('max-w-[80%]', 'p-3', 'rounded-lg', 'mb-3', 'self-start', 'bg-gray-100', 'dark:bg-gray-700', 'rounded-bl-none', 'shadow-md', 'transform', 'transition-all', 'duration-300', 'hover:scale-[1.02]', 'z-10');
        
        // Process markdown-like syntax for code blocks
        if (message.includes('```')) {
            const parts = message.split('```');
            let formattedMessage = '';
            
            for (let i = 0; i < parts.length; i++) {
                if (i % 2 === 0) {
                    // Regular text - process for line breaks
                    formattedMessage += parts[i].replace(/\n/g, '<br>');
                } else {
                    // Code block
                    formattedMessage += `<pre class="bg-gray-200 dark:bg-gray-800 p-3 rounded my-2 overflow-x-auto"><code>${parts[i]}</code></pre>`;
                }
            }
            
            messageElement.innerHTML = formattedMessage;
        } else {
            // Regular text with line breaks
            messageElement.innerHTML = message.replace(/\n/g, '<br>');
        }
        
        chatContainer.appendChild(messageElement);
        scrollToBottom();
    }
    
    // Scroll chat to bottom
    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});

// Add this function to handle code requests
function handleCodeRequest(message) {
    // Show loading spinner
    loadingSpinner.style.display = 'flex';
    
    // Extract programming language from the message
    const langMatch = message.toLowerCase().match(/(?:code in|program in|in) ([a-z\+\#]+)/i);
    const language = langMatch ? langMatch[1] : 'javascript';
    
    // Map common language references to proper code
    const languageMap = {
        'c++': 'cpp',
        'c#': 'csharp',
        'c': 'c',
        'python': 'python',
        'java': 'java',
        'javascript': 'javascript',
        'js': 'javascript',
        'typescript': 'typescript',
        'ts': 'typescript',
        'ruby': 'ruby',
        'go': 'go',
        'php': 'php',
        'swift': 'swift',
        'kotlin': 'kotlin'
    };
    
    const codeLang = languageMap[language] || 'javascript';
    
    // Extract what to implement
    const taskMatch = message.match(/(?:write|create|implement|code for|function to|program to|code to) (.+?)(?:\s+in|$)/i);
    const task = taskMatch ? taskMatch[1].trim() : 'print hello world';
    
    // Generate appropriate code based on language and task
    setTimeout(() => {
        loadingSpinner.style.display = 'none';
        
        let codeResponse = "";
        
        if (task.includes('hello world') || task.includes('print hello')) {
            // Hello World examples for common languages
            switch(codeLang) {
                case 'cpp':
                    codeResponse = "```cpp\n#include <iostream>\n\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}\n```\n\nTo compile and run this code:\n\n```\ng++ hello.cpp -o hello\n./hello\n```";
                    break;
                case 'c':
                    codeResponse = "```c\n#include <stdio.h>\n\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}\n```\n\nTo compile and run this code:\n\n```\ngcc hello.c -o hello\n./hello\n```";
                    break;
                case 'python':
                    codeResponse = "```python\nprint(\"Hello, World!\")\n```\n\nTo run this code:\n\n```\npython hello.py\n```";
                    break;
                case 'java':
                    codeResponse = "```java\npublic class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}\n```\n\nTo compile and run this code:\n\n```\njavac HelloWorld.java\njava HelloWorld\n```";
                    break;
                default:
                    codeResponse = "```javascript\nconsole.log(\"Hello, World!\");\n```\n\nTo run this code:\n\n```\nnode hello.js\n```";
            }
        } else {
            // For other tasks, provide a basic implementation
            // This is a simplified version - you can expand this with more task patterns
            switch(codeLang) {
                case 'cpp':
                    codeResponse = `\`\`\`cpp\n#include <iostream>\n\n// Function to ${task}\nvoid performTask() {\n    // TODO: Implement ${task}\n    std::cout << "Performing task: ${task}" << std::endl;\n}\n\nint main() {\n    performTask();\n    return 0;\n}\n\`\`\``;
                    break;
                case 'python':
                    codeResponse = `\`\`\`python\n# Function to ${task}\ndef perform_task():\n    # TODO: Implement ${task}\n    print(f"Performing task: {task}")\n\nif __name__ == "__main__":\n    perform_task()\n\`\`\``;
                    break;
                default:
                    codeResponse = `\`\`\`javascript\n// Function to ${task}\nfunction performTask() {\n    // TODO: Implement ${task}\n    console.log("Performing task: ${task}");\n}\n\nperformTask();\n\`\`\``;
            }
        }
        
        addBotMessageWithTypingEffect(codeResponse);
        
        // Add to conversation history
        conversationHistory.push({ 
            role: 'user', 
            content: message 
        });
        conversationHistory.push({ 
            role: 'assistant', 
            content: codeResponse 
        });
    }, 1000);
}