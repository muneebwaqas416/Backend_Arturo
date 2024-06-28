const fetch = require("node-fetch");
const { getDifficultWordsFromParagraph } = require("./Mark_Words");


const GPT_func = async (req, res) => {
        try {
            const { message, context } = req.body;
            
            // Modify the context to introduce Eleva English teaching system
            const newContext = context ? `${context}\n` : '';
            const modifiedContext = `${newContext}Eleva English Teaching System:

            Welcome to Eleva! 🚀 I'm here to help you improve your English language skills, whether it's grammar, pronunciation, or vocabulary. As your virtual English tutor, I'll guide you through conversations, correct your grammar mistakes, provide pronunciation assistance, and help you expand your vocabulary.
            
            I understand that learning a new language can be challenging, but with Eleva, you have a supportive learning companion by your side. Feel free to ask me anything about English, and together, we'll work on refining your language skills to help you become more confident and proficient in English communication.
            
            Whether you're a beginner or an advanced learner, Eleva is here to tailor our interactions to your level and learning goals. Let's embark on this journey together and make learning English an enjoyable and rewarding experience!
            
            To get started, simply type or speak your message, and I'll be here to assist you every step of the way. Let's learn and grow together with Eleva!
            `;
    

            const [gpt_response, user_prompt] = context?.map(item => JSON.stringify({
                gpt_response: item.gpt_response,
                user_prompt: item.user_prompt
            }));
            const options = {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {role : "system" , content : gpt_response ? gpt_response : ''},
                        {role : "user" , content : user_prompt ? user_prompt : ''},
                        { role: "system", content: modifiedContext },
                        { role: "user", content: message },
                    ],
                    temperature: 1,
                    max_tokens: 256,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0,
                })
            };
    
            const response = await fetch('https://api.openai.com/v1/chat/completions', options);
            const data = await response.json();
            res.status(200).send(data);
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    };


const getDifficultWords = (req , res)=>{
    try {
        const {value} = req.body;
        
        const list = getDifficultWordsFromParagraph(value);

        return res.json({
            list : list
        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).send({
            message : error.message
        })        
    }
}

const getPronunciation = async (req, res) => {
    try {
        const { difficultWords } = req.body;

        const combinedMessage = difficultWords.join(' ');
        // Modify the context to introduce Eleva English teaching system
        const modifiedContext = `Eleva English Teaching System:

        Welcome to Eleva! 🚀 I'm here to help you improve your English language skills, I am more focused towards Pronunciation  of different english words. As your virtual English tutor, I'll guide you through conversations,  provide pronunciation assistance.
        
        I understand that learning a new language can be challenging, but with Eleva, you have a supportive learning companion by your side. Feel free to ask me anything about English, and together, we'll work on refining your language skills to help you become more confident and proficient in English communication.
        
        Whether you're a beginner or an advanced learner, Eleva is here to tailor our interactions to your level and learning goals. Let's embark on this journey together and make learning English an enjoyable and rewarding experience!
        
        To get started, simply type or speak your message, and I'll be here to assist you every step of the way. Let's learn and grow together with Eleva!
        I am giving you serveral words in the form of the array and I want thier pronounciatons only.I repeat I want only pronounciation.I want pronounciation in english language like this 
        "Sarah" is pronounced as  sair-uh.
        `;

            const options = {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: modifiedContext },
                    { role: "user", content: combinedMessage },
                ],
                temperature: 1,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            })
        };

        const response = await fetch('https://api.openai.com/v1/chat/completions', options);
        const data = await response.json();
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};



module.exports = {GPT_func , getDifficultWords , getPronunciation};