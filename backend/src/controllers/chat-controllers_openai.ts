import User from "../models/User.js";
import { configureOpenAI } from "../../dist/utils/openai-config.js";
import { OpenAIApi } from "openai";
export const generateChatCompletion_openai = async (req, res, next) => {
    const { message } = req.body;
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).json({ message: "User not registered OR Token is malfunctioned" });
        }
        // get the chat from the user
        const chats = user.chats_openai.map(({ role, content }) => ({ role, content })); // this line will copy the content of all the user.chats to chats.
        chats.push({ content: message, role: "user" });
        user.chats_openai.push({ content: message, role: "user" });
        // ----- Jugad Code ------
        user.chats_openai.push({ content: "Currently ChatGPT is not responding. I did a Jugad to give this message. No Paisa Right now. Later i will do it properly Heehhaahhahah", role: "assistant" });
        // user.chats_openai.push({ content: "In Python, a list is a mutable, ordered collection of items. Lists can be created using square brackets `[]` or using the `list()` constructor. Here's the syntax for creating a list:\n\n1. **Using square brackets:**\n\n```python\n# Creating an empty list\nmy_list = []\n\n# Creating a list with elements\nmy_list = [1, 2, 3, 'a', 'b', 'c']\n```\n\n2. **Using the `list()` constructor:**\n\n```python\n# Creating an empty list\nmy_list = list()\n\n# Creating a list from an iterable\nmy_list = list([1, 2, 3, 'a', 'b', 'c'])\n```\n\nLists are versatile and can contain elements of different types, including other lists. Here are some examples of common list operations:\n\n```python\n# Accessing elements\nprint(my_list[0])  # Output: 1\nprint(my_list[-1])  # Output: 'c'\n\n# Adding elements\nmy_list.append('d')\nmy_list.insert(2, 'z')\n\n# Removing elements\nmy_list.remove('a')\nremoved_element = my_list.pop(3)\n\n# Slicing\nsub_list = my_list[1:4]\n\n# Length of the list\nlength = len(my_list)\n\n# Iterating through the list\nfor item in my_list:\n    print(item)\n```", role: "assistant" });
        // console.log(user.chats);
        await user.save();
        return res.status(200).json({ chats: user.chats_openai });
        // ----- Jugad Code ended -----
        // send all the chats including the new one (question) to OpenAI API
        const config = configureOpenAI();
        const openai = new OpenAIApi(config);
        // get the laest response
        const chatResponse = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: chats,
        });
        user.chats_openai.push(chatResponse.data.choices[0].message);
        console.log("Stage4");
        await user.save();
        return res.status(200).json({ chats: user.chats_openai });
    }
    catch (error) {
        // console.log(error)
        return res.status(500).json({ messgae: "Something went wrong" });
    }
};
export const sendChatToUser_openai = async (req, res, next) => {
    console.log("sendChatToUser");
    try {
        // Verifing the token 
        //const user = await User.findOne({ email: res.locals.jwtData.email }); // even this works
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).send("User is not registered or Token malfunctioned");
        }
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permission didn't match ");
        }
        return res.status(200).json({ message: "OK", chats: user.chats_openai });
    }
    catch (error) {
        return res.status(200).json({ message: "ERROR", cause: error.message });
    }
};
export const deleteChats_openai = async (req, res, next) => {
    try {
        // Verifing the token 
        //const user = await User.findOne({ email: res.locals.jwtData.email }); // even this works
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).send("User is not registered or Token malfunctioned");
        }
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permission didn't match ");
        }
        //@ts-ignore
        user.chats_openai = [];
        await user.save();
        return res.status(200).json({ message: "OK", });
    }
    catch (error) {
        return res.status(200).json({ message: "ERROR", cause: error.message });
    }
};
//# sourceMappingURL=chat-controllers.js.map